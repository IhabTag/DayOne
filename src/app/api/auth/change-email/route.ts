import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUser, generateEmailChangeToken, getTokenExpiry, checkRateLimit, incrementRateLimit } from '@/lib/auth';
import { sendEmail, emailChangeTemplate } from '@/lib/email';
import { createAuditLog, AuditActions, handleApiError, ValidationError, AuthenticationError, RateLimitError } from '@/lib/observability';

const changeEmailSchema = z.object({
    newEmail: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new AuthenticationError();
        }

        // Require email verification for email change
        if (!user.emailVerified) {
            throw new ValidationError('Please verify your current email before changing it');
        }

        const body = await request.json();
        const result = changeEmailSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid email address');
        }

        const { newEmail } = result.data;
        const newEmailLower = newEmail.toLowerCase();

        // Check if same as current
        if (newEmailLower === user.email.toLowerCase()) {
            throw new ValidationError('New email must be different from current email');
        }

        // Rate limit
        const rateLimitResult = await checkRateLimit(user.id, 'email_verification');
        if (!rateLimitResult.allowed) {
            throw new RateLimitError('Too many email change requests. Please try again later.', rateLimitResult.resetAt);
        }

        // Check if email is already in use
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmailLower },
        });

        if (existingUser) {
            throw new ValidationError('This email is already in use');
        }

        // Delete any existing email change tokens for this user
        await prisma.emailChangeToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new email change token
        const token = generateEmailChangeToken();
        const expiresAt = getTokenExpiry(24); // 24 hours

        await prisma.emailChangeToken.create({
            data: {
                userId: user.id,
                newEmail: newEmailLower,
                token,
                expiresAt,
            },
        });

        // Send confirmation email to NEW email
        const confirmUrl = `${process.env.APP_URL}/auth/confirm-email-change/${token}`;
        const emailContent = emailChangeTemplate({
            name: user.name || '',
            newEmail: newEmailLower,
            confirmUrl,
        });

        await sendEmail({
            to: newEmailLower,
            subject: 'Confirm your new email address',
            html: emailContent.html,
            text: emailContent.text,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_EMAIL_CHANGE_REQUESTED,
            metadata: { newEmail: newEmailLower },
        });

        // Increment rate limit
        await incrementRateLimit(user.id, 'email_verification');

        return NextResponse.json(
            { message: 'Confirmation email sent to your new email address' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
