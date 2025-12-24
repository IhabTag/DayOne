/**
 * Set Password API Endpoint
 * 
 * POST /api/auth/set-password
 * 
 * Allows OAuth-only users (who have no password) to set a password for the first time.
 * This enables them to also log in with email/password in the future.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, validatePasswordStrength, getCurrentUser, destroyAllUserSessions, createSession } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, ValidationError, AuthenticationError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

const setPasswordSchema = z.object({
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
        const result = setPasswordSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { newPassword } = result.data;

        // Validate password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new ValidationError('Password does not meet requirements', {
                newPassword: passwordValidation.errors,
            });
        }

        // Get user to check if they already have a password
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { passwordHash: true },
        });

        if (!dbUser) {
            throw new AuthenticationError();
        }

        // Only allow setting password if user doesn't have one
        if (dbUser.passwordHash) {
            throw new ValidationError('You already have a password set. Use "Change Password" instead.', {
                newPassword: ['Password already exists'],
            });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Set password
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
            metadata: { method: 'set_password_oauth_user' },
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            { message: 'Password set successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
