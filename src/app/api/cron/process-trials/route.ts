import { NextRequest, NextResponse } from 'next/server';
import { processTrialExpirations } from '@/lib/plans';
import { cleanupExpiredSessions, cleanupExpiredRateLimits } from '@/lib/auth';
import { logger, handleApiError } from '@/lib/observability';

// Secret key for cron job authentication (set via env var)
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
    try {
        // Verify cron secret if set
        if (CRON_SECRET) {
            const authHeader = request.headers.get('authorization');
            const providedSecret = authHeader?.replace('Bearer ', '');

            if (providedSecret !== CRON_SECRET) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        logger.info('Starting trial expiration processing');

        // Process trial expirations
        const trialResult = await processTrialExpirations();

        // Also cleanup expired sessions and rate limits
        const sessionsCleanedUp = await cleanupExpiredSessions();
        const rateLimitsCleanedUp = await cleanupExpiredRateLimits();

        logger.info('Trial expiration processing completed', {
            processed: trialResult.processed,
            downgraded: trialResult.downgraded.length,
            sessionsCleanedUp,
            rateLimitsCleanedUp,
        });

        return NextResponse.json({
            success: true,
            results: {
                trials: {
                    processed: trialResult.processed,
                    downgraded: trialResult.downgraded.length,
                },
                cleanup: {
                    sessions: sessionsCleanedUp,
                    rateLimits: rateLimitsCleanedUp,
                },
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
