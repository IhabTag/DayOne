import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthorizationError } from '@/lib/observability';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const now = new Date();

        const [
            totalUsers,
            activeUsers,
            proUsers,
            basicUsers,
            usersOnTrial,
            recentSignups,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { plan: 'PRO' } }),
            prisma.user.count({ where: { plan: 'BASIC' } }),
            prisma.user.count({
                where: {
                    plan: 'PRO',
                    planOverride: false,
                    trialEndDate: { gt: now },
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        return NextResponse.json({
            totalUsers,
            activeUsers,
            proUsers,
            basicUsers,
            usersOnTrial,
            recentSignups,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
