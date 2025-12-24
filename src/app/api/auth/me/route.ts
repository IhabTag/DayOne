import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getTrialStatus } from '@/lib/plans';
import { handleApiError, AuthenticationError, ValidationError, createAuditLog, AuditActions } from '@/lib/observability';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { user: null },
                { status: 200 }
            );
        }

        // Fetch additional user data including passwordHash check
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { passwordHash: true },
        });

        const trialStatus = getTrialStatus(user.plan, user.trialEndDate, user.planOverride);

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    timezone: user.timezone,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified?.toISOString() || null,
                    plan: user.plan,
                    planOverride: user.planOverride,
                    trialEndDate: user.trialEndDate.toISOString(),
                    createdAt: user.createdAt.toISOString(),
                    // Whether user has a password set (for determining Set vs Change password UI)
                    hasPassword: !!dbUser?.passwordHash,
                },
                trial: {
                    isOnTrial: trialStatus.isOnTrial,
                    isExpired: trialStatus.isExpired,
                    daysRemaining: trialStatus.daysRemaining,
                    endDate: trialStatus.endDate.toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}

const updateProfileSchema = z.object({
    name: z.string().max(100).optional(),
    timezone: z.string().max(50).optional(),
});

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new AuthenticationError();
        }

        const body = await request.json();
        const result = updateProfileSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input');
        }

        const { name, timezone } = result.data;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(timezone !== undefined && { timezone }),
            },
        });

        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_PROFILE_UPDATED,
            metadata: { name, timezone },
        });

        return NextResponse.json(
            {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    timezone: updatedUser.timezone,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
