import type { Plan } from '@/generated/prisma';

/**
 * Feature definitions per plan
 */
interface PlanFeatures {
    maxProjects: number;
    maxTeamMembers: number;
    canAccessAdvancedAnalytics: boolean;
    canAccessPrioritySupport: boolean;
    canExportData: boolean;
    canUseApiAccess: boolean;
    canCustomizeBranding: boolean;
    storageGb: number;
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
    BASIC: {
        maxProjects: 3,
        maxTeamMembers: 1,
        canAccessAdvancedAnalytics: false,
        canAccessPrioritySupport: false,
        canExportData: false,
        canUseApiAccess: false,
        canCustomizeBranding: false,
        storageGb: 1,
    },
    PRO: {
        maxProjects: Infinity,
        maxTeamMembers: 10,
        canAccessAdvancedAnalytics: true,
        canAccessPrioritySupport: true,
        canExportData: true,
        canUseApiAccess: true,
        canCustomizeBranding: true,
        storageGb: 100,
    },
};

export type Feature = keyof PlanFeatures;

/**
 * Get all features for a plan
 */
export function getPlanFeatures(plan: Plan): PlanFeatures {
    return PLAN_FEATURES[plan];
}

/**
 * Check if a plan has access to a specific feature
 */
export function canAccessFeature(plan: Plan, feature: Feature): boolean {
    const features = PLAN_FEATURES[plan];
    const value = features[feature];

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value > 0;
    }

    return false;
}

/**
 * Get the limit value for a feature
 */
export function getFeatureLimit(plan: Plan, feature: Feature): number {
    const features = PLAN_FEATURES[plan];
    const value = features[feature];

    if (typeof value === 'number') {
        return value;
    }

    // For boolean features, return 1 if true, 0 if false
    return value ? 1 : 0;
}

/**
 * Check if a user has reached their limit for a feature
 */
export function hasReachedLimit(plan: Plan, feature: Feature, currentCount: number): boolean {
    const limit = getFeatureLimit(plan, feature);
    return currentCount >= limit;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: Plan): string {
    return plan === 'PRO' ? 'Pro' : 'Basic';
}

/**
 * Plan comparison info for upgrade prompts
 */
export interface PlanComparisonItem {
    feature: string;
    basic: string | boolean;
    pro: string | boolean;
}

export function getPlanComparison(): PlanComparisonItem[] {
    return [
        { feature: 'Projects', basic: '3', pro: 'Unlimited' },
        { feature: 'Team Members', basic: '1', pro: 'Up to 10' },
        { feature: 'Storage', basic: '1 GB', pro: '100 GB' },
        { feature: 'Advanced Analytics', basic: false, pro: true },
        { feature: 'Priority Support', basic: false, pro: true },
        { feature: 'Data Export', basic: false, pro: true },
        { feature: 'API Access', basic: false, pro: true },
        { feature: 'Custom Branding', basic: false, pro: true },
    ];
}
