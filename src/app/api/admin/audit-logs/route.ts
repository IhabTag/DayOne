import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthorizationError } from '@/lib/observability';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const action = searchParams.get('action') || '';
        const userId = searchParams.get('userId') || '';

        const where = {
            ...(action && { action: { contains: action } }),
            ...(userId && { userId }),
        };

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.auditLog.count({ where }),
        ]);

        return NextResponse.json({
            logs: logs.map(log => ({
                id: log.id,
                userId: log.userId,
                actorId: log.actorId,
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId,
                metadata: log.metadata,
                createdAt: log.createdAt.toISOString(),
                user: log.user,
            })),
            total,
            page,
            limit,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
