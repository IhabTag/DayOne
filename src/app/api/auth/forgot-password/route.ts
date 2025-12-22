import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { generatePasswordResetToken, getTokenExpiry, checkRateLimit, incrementRateLimit, getRateLimitHeaders } from '@/lib/auth';
import { sendEmail, passwordResetTemplate } from '@/lib/email';
import { createAuditLog, AuditActions, handleApiError, ValidationError, RateLimitError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);

        const body = await request.json();
        const result = forgotPasswordSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid email address');
        }

        const { email } = result.data;
        const emailLower = email.toLowerCase();

        // Rate limit by email
        const rateLimitResult = await checkRateLimit(emailLower, 'password_reset');
        if (!rateLimitResult.allowed) {
            throw new RateLimitError('Too many password reset requests. Please try again later.', rateLimitResult.resetAt);
        }

        // Always return success to prevent email enumeration
        const successResponse = NextResponse.json(
            { message: 'If an account exists with this email, you will receive a password reset link.' },
            {
                status: 200,
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: emailLower },
        });

        if (!user) {
            // Increment rate limit even for non-existent users
            await incrementRateLimit(emailLower, 'password_reset');
            return successResponse;
        }

        // Delete any existing password reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new password reset token
        const token = generatePasswordResetToken();
        const expiresAt = getTokenExpiry(
            parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_HOURS || '1', 10)
        );

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });

        // Send password reset email
        const resetUrl = `${process.env.APP_URL}/auth/reset-password/${token}`;
        const emailContent = passwordResetTemplate({
            name: user.name || '',
            resetUrl,
        });

        await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            html: emailContent.html,
            text: emailContent.text,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_PASSWORD_RESET_REQUESTED,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        // Increment rate limit
        await incrementRateLimit(emailLower, 'password_reset');

        return successResponse;
    } catch (error) {
        return handleApiError(error);
    }
}
