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

        const startTime = Date.now();

        // Check database connection
        let dbStatus: 'connected' | 'disconnected' = 'disconnected';
        let dbLatency = 0;
        try {
            await prisma.$queryRaw`SELECT 1`;
            dbLatency = Date.now() - startTime;
            dbStatus = 'connected';
        } catch {
            dbStatus = 'disconnected';
        }

        // Get session counts
        const now = new Date();
        const [activeSessions, expiredSessions] = await Promise.all([
            prisma.session.count({
                where: { expiresAt: { gt: now } },
            }),
            prisma.session.count({
                where: { expiresAt: { lte: now } },
            }),
        ]);

        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        const memoryPercentage = (usedMemory / totalMemory) * 100;

        // Calculate uptime
        const uptime = process.uptime();

        // Determine overall status
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        if (dbStatus === 'disconnected') {
            status = 'unhealthy';
        } else if (dbLatency > 500 || memoryPercentage > 90) {
            status = 'degraded';
        }

        return NextResponse.json({
            status,
            database: {
                status: dbStatus,
                latency: dbLatency,
            },
            sessions: {
                active: activeSessions,
                expired: expiredSessions,
            },
            memory: {
                used: usedMemory,
                total: totalMemory,
                percentage: memoryPercentage,
            },
            uptime,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
