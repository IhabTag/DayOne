/**
 * Google OAuth Initiation Endpoint
 * 
 * GET /api/auth/google
 * 
 * Redirects user to Google OAuth consent screen.
 * Includes CSRF state parameter for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    isGoogleOAuthEnabled,
    generateOAuthState,
    generateGoogleAuthUrl,
    checkRateLimit,
    incrementRateLimit,
} from '@/lib/auth';
import { getRequestMetadata } from '@/lib/utils';

// Cookie name for storing referral context during OAuth flow
const OAUTH_REFERRAL_COOKIE = 'oauth_ref';

export async function GET(request: NextRequest) {
    // Check if Google OAuth is enabled
    if (!isGoogleOAuthEnabled()) {
        return NextResponse.json(
            { error: 'Google OAuth is not enabled' },
            { status: 404 }
        );
    }

    const { ipAddress } = getRequestMetadata(request);
    const identifier = ipAddress || 'unknown';

    // Rate limit Google auth attempts
    const rateLimitResult = await checkRateLimit(identifier, 'google_oauth');
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Too many authentication attempts. Please try again later.' },
            { status: 429 }
        );
    }

    // Increment rate limit
    await incrementRateLimit(identifier, 'google_oauth');

    // Preserve referral cookie during OAuth flow
    // The ap_ref cookie may be set from visiting a referral URL
    const referralCookie = request.cookies.get('ap_ref')?.value;

    // Generate CSRF state parameter
    const state = await generateOAuthState();

    // Store referral context in a separate cookie that persists through OAuth
    if (referralCookie) {
        const cookieStore = await cookies();
        cookieStore.set(OAUTH_REFERRAL_COOKIE, referralCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
            path: '/',
        });
    }

    // Generate Google OAuth URL and redirect
    const authUrl = generateGoogleAuthUrl(state);

    return NextResponse.redirect(authUrl);
}
