/**
 * Google OAuth Callback Endpoint
 * 
 * GET /api/auth/google/callback
 * 
 * Handles the OAuth callback from Google after user consent.
 * Implements the account resolution logic:
 * 1. If user already linked to Google provider → log in
 * 2. Else if user exists with same email → link provider, verify email, log in
 * 3. Else if GOOGLE_OAUTH_ALLOW_SIGNUP=true → create new user, log in
 * 4. Else → redirect to login with error
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import {
    isGoogleOAuthEnabled,
    isGoogleSignupAllowed,
    shouldAutoVerifyGoogleEmail,
    validateOAuthState,
    exchangeCodeForTokens,
    verifyGoogleIdToken,
    createSession,
} from '@/lib/auth';
import { createAuditLog, AuditActions, logger } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';
import { addDays } from 'date-fns';
import { calculateTrialEndDate } from '@/lib/plans';
import { RegistrationSource } from '@/generated/prisma';

// Cookie names
const OAUTH_REFERRAL_COOKIE = 'oauth_ref';
const REFERRAL_COOKIE = 'ap_ref';

export async function GET(request: NextRequest) {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Helper to redirect with error
    const redirectWithError = (message: string) => {
        const url = new URL('/auth/login', appUrl);
        url.searchParams.set('error', message);
        return NextResponse.redirect(url);
    };

    try {
        // =================================================================
        // 1. VALIDATE PREREQUISITES
        // =================================================================

        // Check if Google OAuth is enabled
        if (!isGoogleOAuthEnabled()) {
            return NextResponse.json(
                { error: 'Google OAuth is not enabled' },
                { status: 404 }
            );
        }

        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors from Google
        if (error) {
            logger.warn('Google OAuth error', { error });
            return redirectWithError('Authentication was cancelled or failed');
        }

        // Validate required parameters
        if (!code || !state) {
            logger.warn('Missing OAuth parameters', { hasCode: !!code, hasState: !!state });
            return redirectWithError('Invalid OAuth callback');
        }

        // =================================================================
        // 2. VALIDATE CSRF STATE
        // =================================================================

        const isValidState = await validateOAuthState(state);
        if (!isValidState) {
            logger.warn('Invalid OAuth state - possible CSRF attack', { ipAddress });
            return redirectWithError('Invalid authentication state. Please try again.');
        }

        // =================================================================
        // 3. EXCHANGE CODE FOR TOKENS & VERIFY
        // =================================================================

        const tokens = await exchangeCodeForTokens(code);
        const googleUser = await verifyGoogleIdToken(tokens.idToken);

        if (!googleUser.email) {
            logger.error('Google user has no email', { sub: googleUser.sub });
            return redirectWithError('Could not retrieve email from Google');
        }

        const email = googleUser.email.toLowerCase();

        // =================================================================
        // 4. ACCOUNT RESOLUTION LOGIC
        // =================================================================

        // Get referral context from OAuth flow
        const cookieStore = await cookies();
        const oauthReferralCookie = cookieStore.get(OAUTH_REFERRAL_COOKIE)?.value;
        cookieStore.delete(OAUTH_REFERRAL_COOKIE); // Clean up

        // Check if this Google account is already linked to a user
        const existingProvider = await prisma.userAuthProvider.findUnique({
            where: {
                provider_providerUserId: {
                    provider: 'GOOGLE',
                    providerUserId: googleUser.sub,
                },
            },
            include: { user: true },
        });

        let user;
        let actionType: 'login' | 'signup' | 'linked';

        if (existingProvider) {
            // -----------------------------------------------------------------
            // CASE 1: User already linked to this Google account → Log in
            // -----------------------------------------------------------------
            user = existingProvider.user;
            actionType = 'login';

            // Check if user is deactivated
            if (user.status === 'DEACTIVATED') {
                return redirectWithError('This account has been deactivated. Please contact support.');
            }

        } else {
            // Check if a user exists with the same email
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                // -------------------------------------------------------------
                // CASE 2: User exists with same email → Link provider
                // -------------------------------------------------------------
                user = existingUser;
                actionType = 'linked';

                // Check if user is deactivated
                if (user.status === 'DEACTIVATED') {
                    return redirectWithError('This account has been deactivated. Please contact support.');
                }

                // Link Google provider to existing user
                await prisma.userAuthProvider.create({
                    data: {
                        userId: user.id,
                        provider: 'GOOGLE',
                        providerUserId: googleUser.sub,
                    },
                });

                // Auto-verify email if enabled and Google verified the email
                if (shouldAutoVerifyGoogleEmail() && googleUser.emailVerified && !user.emailVerified) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { emailVerified: new Date() },
                    });

                    await createAuditLog({
                        userId: user.id,
                        action: AuditActions.USER_EMAIL_VERIFIED,
                        metadata: { method: 'google_oauth' },
                        ipAddress: ipAddress || undefined,
                        userAgent: userAgent || undefined,
                    });
                }

                // Update avatar if not set
                if (!user.avatar && googleUser.picture) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { avatar: googleUser.picture },
                    });
                }

                await createAuditLog({
                    userId: user.id,
                    action: AuditActions.USER_OAUTH_LINKED,
                    metadata: { provider: 'google' },
                    ipAddress: ipAddress || undefined,
                    userAgent: userAgent || undefined,
                });

            } else {
                // -------------------------------------------------------------
                // CASE 3 or 4: No existing user
                // -------------------------------------------------------------

                if (!isGoogleSignupAllowed()) {
                    // CASE 4: Signups not allowed → Block
                    await createAuditLog({
                        action: AuditActions.USER_OAUTH_LOGIN_BLOCKED,
                        metadata: { email, reason: 'signup_disabled' },
                        ipAddress: ipAddress || undefined,
                        userAgent: userAgent || undefined,
                    });

                    return redirectWithError('No account found with this email. Please sign up first.');
                }

                // CASE 3: Create new user with referral/trial logic
                actionType = 'signup';

                // Check for referral link
                let referralLink = null;
                const referralCookieValue = oauthReferralCookie || cookieStore.get(REFERRAL_COOKIE)?.value;

                if (referralCookieValue) {
                    referralLink = await prisma.referralLink.findUnique({
                        where: { id: referralCookieValue },
                        select: {
                            id: true,
                            trialDays: true,
                            isActive: true,
                        },
                    });

                    if (referralLink && !referralLink.isActive) {
                        referralLink = null;
                    }
                }

                // Calculate trial end date
                let trialEndDate: Date;
                let trialDaysGranted: number | null = null;

                if (referralLink) {
                    trialDaysGranted = referralLink.trialDays;
                    trialEndDate = addDays(new Date(), referralLink.trialDays);
                } else {
                    trialEndDate = calculateTrialEndDate();
                }

                // Create new user (no password for OAuth-only signup)
                user = await prisma.user.create({
                    data: {
                        email,
                        name: googleUser.name || null,
                        avatar: googleUser.picture || null,
                        // passwordHash is null for OAuth-only users
                        passwordHash: null,
                        // Auto-verify email if enabled and Google verified it
                        emailVerified: (shouldAutoVerifyGoogleEmail() && googleUser.emailVerified)
                            ? new Date()
                            : null,
                        trialEndDate,
                        // Referral attribution
                        referrerId: referralLink?.id || null,
                        registrationSource: referralLink
                            ? RegistrationSource.REFERRAL
                            : RegistrationSource.NORMAL,
                        trialDaysGranted,
                    },
                });

                // Create auth provider link
                await prisma.userAuthProvider.create({
                    data: {
                        userId: user.id,
                        provider: 'GOOGLE',
                        providerUserId: googleUser.sub,
                    },
                });

                await createAuditLog({
                    userId: user.id,
                    action: AuditActions.USER_OAUTH_SIGNUP,
                    metadata: {
                        provider: 'google',
                        hasReferral: !!referralLink,
                        trialDays: trialDaysGranted || parseInt(process.env.TRIAL_DURATION_DAYS || '14', 10),
                    },
                    ipAddress: ipAddress || undefined,
                    userAgent: userAgent || undefined,
                });
            }
        }

        // =================================================================
        // 5. CREATE SESSION & REDIRECT
        // =================================================================

        await createSession(user.id, { ipAddress, userAgent });

        // Log the login event (for existing users or after signup)
        if (actionType === 'login') {
            await createAuditLog({
                userId: user.id,
                action: AuditActions.USER_OAUTH_LOGIN,
                metadata: { provider: 'google' },
                ipAddress: ipAddress || undefined,
                userAgent: userAgent || undefined,
            });
        }

        // Create redirect response
        const response = NextResponse.redirect(new URL('/dashboard', appUrl));

        // Clear the referral cookie after successful auth
        response.cookies.delete(REFERRAL_COOKIE);

        return response;

    } catch (error) {
        logger.error('Google OAuth callback error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            ipAddress,
        });

        return redirectWithError('An error occurred during authentication. Please try again.');
    }
}
