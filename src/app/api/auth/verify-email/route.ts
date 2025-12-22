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
            throw new ValidationError('Verification token is required');
        }

        // Find the token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken) {
            throw new NotFoundError('Invalid or expired verification token');
        }

        // Check if token is expired
        if (isTokenExpired(verificationToken.expiresAt)) {
            // Delete expired token
            await prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            });
            throw new ValidationError('Verification token has expired. Please request a new one.');
        }

        // Check if already verified
        if (verificationToken.user.emailVerified) {
            // Clean up the token
            await prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            });

            return NextResponse.json(
                { message: 'Email is already verified' },
                { status: 200 }
            );
        }

        // Update user as verified
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: new Date() },
        });

        // Delete the used token
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        // Delete any other verification tokens for this user
        await prisma.verificationToken.deleteMany({
            where: { userId: verificationToken.userId },
        });

        // Audit log
        await createAuditLog({
            userId: verificationToken.userId,
            action: AuditActions.USER_EMAIL_VERIFIED,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            { message: 'Email verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
