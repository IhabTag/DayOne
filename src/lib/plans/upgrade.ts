import prisma from '@/lib/db';
import { createAuditLog } from '@/lib/observability/audit';
import { addDays } from 'date-fns';
import type { Plan } from '@/generated/prisma';

/**
 * Upgrade a user to a new plan (admin action)
 */
export async function upgradePlan(
    userId: string,
    newPlan: Plan,
    actorId: string,
    options: { overrideTrialBehavior?: boolean } = {}
): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true },
        });

        if (!user) {
            return false;
        }

        const previousPlan = user.plan;

        await prisma.user.update({
            where: { id: userId },
            data: {
                plan: newPlan,
                planChangedAt: new Date(),
                planOverride: options.overrideTrialBehavior ?? true,
            },
        });

        await createAuditLog({
            userId,
            actorId,
            action: 'user.plan.changed',
            metadata: {
                previousPlan,
                newPlan,
                overrideTrialBehavior: options.overrideTrialBehavior ?? true,
            },
        });

        return true;
    } catch {
        return false;
    }
}

/**
 * Extend a user's trial period (admin action)
 */
export async function extendTrial(
    userId: string,
    additionalDays: number,
    actorId: string
): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { trialEndDate: true },
        });

        if (!user) {
            return false;
        }

        const previousEndDate = user.trialEndDate;
        const newEndDate = addDays(previousEndDate, additionalDays);

        await prisma.user.update({
            where: { id: userId },
            data: {
                trialEndDate: newEndDate,
                // Ensure they're on Pro if extending trial
                plan: 'PRO',
                planOverride: false, // Keep them in trial mode
            },
        });

        await createAuditLog({
            userId,
            actorId,
            action: 'user.trial.extended',
            metadata: {
                previousEndDate: previousEndDate.toISOString(),
                newEndDate: newEndDate.toISOString(),
                additionalDays,
            },
        });

        return true;
    } catch {
        return false;
    }
}

/**
 * Reset trial (admin action) - gives user a fresh trial
 */
export async function resetTrial(
    userId: string,
    actorId: string,
    trialDays: number = 14
): Promise<boolean> {
    try {
        const now = new Date();
        const newEndDate = addDays(now, trialDays);

        await prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'PRO',
                trialStartDate: now,
                trialEndDate: newEndDate,
                planOverride: false,
                planChangedAt: now,
            },
        });

        await createAuditLog({
            userId,
            actorId,
            action: 'user.trial.reset',
            metadata: {
                newTrialEndDate: newEndDate.toISOString(),
                trialDays,
            },
        });

        return true;
    } catch {
        return false;
    }
}
