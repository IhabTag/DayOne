import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isTokenExpired } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, ValidationError, NotFoundError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);

        const body = await request.json();
        const { token } = body;

        if (!token || typeof token !== 'string') {
            throw new ValidationError('Token is required');
        }

        // Find the token
        const emailChangeToken = await prisma.emailChangeToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!emailChangeToken) {
            throw new NotFoundError('Invalid or expired token');
        }

        // Check if token is expired
        if (isTokenExpired(emailChangeToken.expiresAt)) {
            await prisma.emailChangeToken.delete({
                where: { id: emailChangeToken.id },
            });
            throw new ValidationError('Token has expired. Please request a new email change.');
        }

        // Check if new email is still available
        const existingUser = await prisma.user.findUnique({
            where: { email: emailChangeToken.newEmail },
        });

        if (existingUser) {
            await prisma.emailChangeToken.delete({
                where: { id: emailChangeToken.id },
            });
            throw new ValidationError('This email is no longer available');
        }

        const oldEmail = emailChangeToken.user.email;

        // Update user email
        await prisma.user.update({
            where: { id: emailChangeToken.userId },
            data: {
                email: emailChangeToken.newEmail,
                // Keep email as verified since they confirmed via the new email
                emailVerified: new Date(),
            },
        });

        // Delete the used token
        await prisma.emailChangeToken.delete({
            where: { id: emailChangeToken.id },
        });

        // Delete any other email change tokens for this user
        await prisma.emailChangeToken.deleteMany({
            where: { userId: emailChangeToken.userId },
        });

        // Audit log
        await createAuditLog({
            userId: emailChangeToken.userId,
            action: AuditActions.USER_EMAIL_CHANGED,
            metadata: {
                oldEmail,
                newEmail: emailChangeToken.newEmail,
            },
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            { message: 'Email changed successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
