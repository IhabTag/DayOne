import prisma from '@/lib/db';
import { createAuditLog } from '@/lib/observability/audit';
import { isTrialExpired } from './trial';

/**
 * Process trial expirations and downgrade users to Basic plan
 * Returns the number of users downgraded
 */
export async function processTrialExpirations(): Promise<{
    processed: number;
    downgraded: string[];
}> {
    const now = new Date();

    // Find users who:
    // 1. Are on PRO plan
    // 2. Have expired trials
    // 3. Don't have plan override (admin-set plans)
    const usersToDowngrade = await prisma.user.findMany({
        where: {
            plan: 'PRO',
            planOverride: false,
            trialEndDate: { lt: now },
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });

    const downgraded: string[] = [];

    for (const user of usersToDowngrade) {
        try {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    plan: 'BASIC',
                    planChangedAt: now,
                },
            });

            // Log the downgrade
            await createAuditLog({
                userId: user.id,
                action: 'user.plan.auto_downgraded',
                metadata: {
                    previousPlan: 'PRO',
                    newPlan: 'BASIC',
                    reason: 'trial_expired',
                },
            });

            downgraded.push(user.id);
        } catch (error) {
            console.error(`Failed to downgrade user ${user.id}:`, error);
        }
    }

    return {
        processed: usersToDowngrade.length,
        downgraded,
    };
}

/**
 * Check if a specific user should be downgraded
 */
export async function shouldDowngradeUser(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            plan: true,
            trialEndDate: true,
            planOverride: true,
        },
    });

    if (!user) {
        return false;
    }

    return (
        user.plan === 'PRO' &&
        !user.planOverride &&
        isTrialExpired(user.trialEndDate)
    );
}

/**
 * Downgrade a specific user
 */
export async function downgradeUser(userId: string, actorId?: string): Promise<boolean> {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'BASIC',
                planChangedAt: new Date(),
            },
        });

        await createAuditLog({
            userId: user.id,
            actorId,
            action: 'user.plan.downgraded',
            metadata: {
                previousPlan: 'PRO',
                newPlan: 'BASIC',
            },
        });

        return true;
    } catch {
        return false;
    }
}
