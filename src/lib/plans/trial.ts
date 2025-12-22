import { addDays } from 'date-fns';

const TRIAL_DURATION_DAYS = parseInt(process.env.TRIAL_DURATION_DAYS || '14', 10);

/**
 * Calculate trial end date from start date
 */
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
    return addDays(startDate, TRIAL_DURATION_DAYS);
}

/**
 * Check if a trial has expired
 */
export function isTrialExpired(trialEndDate: Date): boolean {
    return new Date() > trialEndDate;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEndDate: Date): number {
    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

/**
 * Check if user is currently on trial
 */
export function isOnTrial(plan: string, trialEndDate: Date, planOverride: boolean): boolean {
    // If plan was manually set by admin, not considered on trial
    if (planOverride) {
        return false;
    }

    // On trial if they have Pro plan and trial hasn't expired
    return plan === 'PRO' && !isTrialExpired(trialEndDate);
}

/**
 * Get trial status info
 */
export interface TrialStatus {
    isOnTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
    endDate: Date;
}

export function getTrialStatus(
    plan: string,
    trialEndDate: Date,
    planOverride: boolean
): TrialStatus {
    const expired = isTrialExpired(trialEndDate);
    const onTrial = isOnTrial(plan, trialEndDate, planOverride);
    const daysRemaining = onTrial ? getTrialDaysRemaining(trialEndDate) : 0;

    return {
        isOnTrial: onTrial,
        isExpired: expired,
        daysRemaining,
        endDate: trialEndDate,
    };
}
