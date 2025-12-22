import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, verifyPassword, validatePasswordStrength, getCurrentUser, destroyAllUserSessions, createSession } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, ValidationError, AuthenticationError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(1, 'New password is required'),
});

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);

        const user = await getCurrentUser();
        if (!user) {
            throw new AuthenticationError();
        }

        const body = await request.json();
        const result = changePasswordSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { currentPassword, newPassword } = result.data;

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new ValidationError('New password does not meet requirements', {
                newPassword: passwordValidation.errors,
            });
        }

        // Get user with password hash
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { passwordHash: true },
        });

        if (!dbUser) {
            throw new AuthenticationError();
        }

        // Verify current password
        const isValidPassword = await verifyPassword(currentPassword, dbUser.passwordHash);
        if (!isValidPassword) {
            throw new ValidationError('Current password is incorrect', {
                currentPassword: ['Current password is incorrect'],
            });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        // Invalidate all existing sessions
        await destroyAllUserSessions(user.id);

        // Create new session for current device
        await createSession(user.id, { ipAddress, userAgent });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_PASSWORD_CHANGED,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            { message: 'Password changed successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
