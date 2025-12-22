import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthorizationError, NotFoundError, createAuditLog, AuditActions } from '@/lib/observability';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                plan: true,
                planOverride: true,
                trialEndDate: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return NextResponse.json({
            user: {
                ...user,
                emailVerified: user.emailVerified?.toISOString() || null,
                trialEndDate: user.trialEndDate.toISOString(),
                createdAt: user.createdAt.toISOString(),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

const actionSchema = z.object({
    action: z.enum(['changeRole', 'changeStatus', 'changePlan', 'extendTrial']),
    role: z.enum(['USER', 'SUPERADMIN']).optional(),
    status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
    plan: z.enum(['BASIC', 'PRO']).optional(),
    days: z.number().min(1).max(365).optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const { id } = await params;
        const body = await request.json();
        const result = actionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            throw new NotFoundError('User not found');
        }

        const { action, role, status, plan, days } = result.data;

        let updateData: Record<string, unknown> = {};
        let auditAction = '';
        let auditMetadata: Record<string, unknown> = {};

        switch (action) {
            case 'changeRole':
                if (!role) {
                    return NextResponse.json({ message: 'Role is required' }, { status: 400 });
                }
                updateData = { role };
                auditAction = AuditActions.USER_ROLE_CHANGED;
                auditMetadata = { oldRole: targetUser.role, newRole: role, adminId: currentUser.id };
                break;

            case 'changeStatus':
                if (!status) {
                    return NextResponse.json({ message: 'Status is required' }, { status: 400 });
                }
                updateData = { status };
                auditAction = AuditActions.USER_STATUS_CHANGED;
                auditMetadata = { oldStatus: targetUser.status, newStatus: status, adminId: currentUser.id };
                break;

            case 'changePlan':
                if (!plan) {
                    return NextResponse.json({ message: 'Plan is required' }, { status: 400 });
                }
                updateData = { plan, planOverride: true };
                auditAction = AuditActions.USER_PLAN_CHANGED;
                auditMetadata = { oldPlan: targetUser.plan, newPlan: plan, adminId: currentUser.id };
                break;

            case 'extendTrial':
                const daysToAdd = days || 14;
                const currentEnd = new Date(targetUser.trialEndDate);
                const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + daysToAdd * 24 * 60 * 60 * 1000);
                updateData = { trialEndDate: newEnd, plan: 'PRO' };
                auditAction = AuditActions.USER_TRIAL_EXTENDED;
                auditMetadata = {
                    oldTrialEnd: targetUser.trialEndDate.toISOString(),
                    newTrialEnd: newEnd.toISOString(),
                    daysAdded: daysToAdd,
                    adminId: currentUser.id,
                };
                break;
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: id,
            actorId: currentUser.id,
            action: auditAction,
            metadata: auditMetadata,
        });

        return NextResponse.json({ message: 'Action completed successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
