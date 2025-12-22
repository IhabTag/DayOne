import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, generateVerificationToken, getTokenExpiry, checkRateLimit, incrementRateLimit } from '@/lib/auth';
import { sendEmail, verifyEmailTemplate } from '@/lib/email';
import { createAuditLog, AuditActions, handleApiError, AuthenticationError, RateLimitError } from '@/lib/observability';

export async function POST() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new AuthenticationError();
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { message: 'Email is already verified' },
                { status: 200 }
            );
        }

        // Rate limit by user ID
        const rateLimitResult = await checkRateLimit(user.id, 'email_verification');
        if (!rateLimitResult.allowed) {
            throw new RateLimitError('Too many verification emails requested. Please wait before trying again.', rateLimitResult.resetAt);
        }

        // Delete any existing verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new verification token
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

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_EMAIL_VERIFICATION_SENT,
        });

        // Increment rate limit
        await incrementRateLimit(user.id, 'email_verification');

        return NextResponse.json(
            { message: 'Verification email sent' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
