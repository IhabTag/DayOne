import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthorizationError, NotFoundError } from '@/lib/observability';

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

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const logs = await prisma.auditLog.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                action: true,
                metadata: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            logs: logs.map(log => ({
                ...log,
                createdAt: log.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
