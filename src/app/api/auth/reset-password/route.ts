import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, validatePasswordStrength, isTokenExpired, destroyAllUserSessions } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, ValidationError, NotFoundError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * GET - Validate a password reset token
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { valid: false, message: 'Token is required' },
                { status: 400 }
            );
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { valid: false, message: 'Invalid token' },
                { status: 404 }
            );
        }

        if (isTokenExpired(resetToken.expiresAt)) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });
            return NextResponse.json(
                { valid: false, message: 'Token has expired' },
                { status: 410 }
            );
        }

        return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);

        const body = await request.json();
        const result = resetPasswordSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { token, password } = result.data;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw new ValidationError('Password does not meet requirements', {
                password: passwordValidation.errors,
            });
        }

        // Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken) {
            throw new NotFoundError('Invalid or expired reset token');
        }

        // Check if token is expired
        if (isTokenExpired(resetToken.expiresAt)) {
            // Delete expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });
            throw new ValidationError('Reset token has expired. Please request a new one.');
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update user password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });

        // Delete the used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        // Delete any other password reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: resetToken.userId },
        });

        // Invalidate all existing sessions (security measure)
        await destroyAllUserSessions(resetToken.userId);

        // Audit log
        await createAuditLog({
            userId: resetToken.userId,
            action: AuditActions.USER_PASSWORD_RESET_COMPLETED,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            { message: 'Password reset successfully. Please login with your new password.' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
