import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
    hashPassword,
    validatePasswordStrength,
    generateVerificationToken,
    getTokenExpiry,
    createSession,
    incrementRateLimit,
    checkRateLimit,
    getRateLimitHeaders,
} from '@/lib/auth';
import { sendEmail, verifyEmailTemplate } from '@/lib/email';
import { createAuditLog, AuditActions, handleApiError, RateLimitError, ValidationError } from '@/lib/observability';
import { calculateTrialEndDate } from '@/lib/plans';
import { getRequestMetadata } from '@/lib/utils';

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    name: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);
        const identifier = ipAddress || 'unknown';

        // Check rate limit
        const rateLimitResult = await checkRateLimit(identifier, 'signup');
        if (!rateLimitResult.allowed) {
            throw new RateLimitError('Too many signup attempts. Please try again later.', rateLimitResult.resetAt);
        }

        // Parse and validate request body
        const body = await request.json();
        const result = signupSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { email, password, name } = result.data;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw new ValidationError('Password does not meet requirements', {
                password: passwordValidation.errors,
            });
        }

        // Check if user already exists (use generic error to prevent enumeration)
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            // Increment rate limit even for existing users
            await incrementRateLimit(identifier, 'signup');

            // Return success-like response to prevent enumeration
            // But don't actually create anything
            return NextResponse.json(
                { message: 'If this email is not registered, you will receive a verification email.' },
                { status: 200 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Calculate trial end date (14 days from now)
        const trialEndDate = calculateTrialEndDate();

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name: name || null,
                trialEndDate,
            },
        });

        // Create verification token
        const token = generateVerificationToken();
        const expiresAt = getTokenExpiry(
            parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS || '24', 10)
        );

        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });

        // Send verification email
        const verificationUrl = `${process.env.APP_URL}/auth/verify-email/${token}`;
        const emailContent = verifyEmailTemplate({
            name: user.name || '',
            verificationUrl,
        });

        await sendEmail({
            to: user.email,
            subject: 'Verify your email address',
            html: emailContent.html,
            text: emailContent.text,
        });

        // Create session (user can access limited features while unverified)
        await createSession(user.id, { ipAddress, userAgent });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_SIGNUP,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_EMAIL_VERIFICATION_SENT,
        });

        // Increment rate limit
        await incrementRateLimit(identifier, 'signup');

        return NextResponse.json(
            {
                message: 'Account created! Please check your email to verify your account.',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: false,
                },
            },
            {
                status: 201,
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
