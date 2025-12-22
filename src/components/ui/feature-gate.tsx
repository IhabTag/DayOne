'use client';

import { ReactNode } from 'react';
import { Alert } from '@/components/ui';

// Define Plan type locally to avoid build-time dependency on generated prisma
type Plan = 'BASIC' | 'PRO';

// Define features locally - mirrors lib/rbac/entitlements but avoids import issues
type Feature =
    | 'maxProjects'
    | 'maxTeamMembers'
    | 'canAccessAdvancedAnalytics'
    | 'canAccessPrioritySupport'
    | 'canExportData'
    | 'canUseApiAccess'
    | 'canCustomizeBranding'
    | 'storageGb';

const PLAN_FEATURES: Record<Plan, Record<Feature, number | boolean>> = {
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

function canAccessFeature(plan: Plan, feature: Feature): boolean {
    const value = PLAN_FEATURES[plan][feature];
    if (typeof value === 'boolean') {
        return value;
    }
    return value > 0;
}

interface FeatureGateProps {
    plan: Plan;
    feature: Feature;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that gates content based on plan features.
 * Shows children if user has access, otherwise shows upgrade prompt.
 */
export function FeatureGate({
    plan,
    feature,
    children,
    fallback,
}: FeatureGateProps) {
    const hasAccess = canAccessFeature(plan, feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="feature-gate-upgrade">
            <Alert
                variant="info"
                title="Pro Feature"
            >
                This feature requires a Pro plan. Upgrade to unlock it.
            </Alert>
        </div>
    );
}

interface ProOnlyProps {
    plan: Plan;
    children: ReactNode;
    showUpgradePrompt?: boolean;
}

/**
 * Simple wrapper that only renders children for Pro plan users.
 */
export function ProOnly({
    plan,
    children,
    showUpgradePrompt = false,
}: ProOnlyProps) {
    if (plan === 'PRO') {
        return <>{children}</>;
    }

    if (!showUpgradePrompt) {
        return null;
    }

    return (
        <div className="pro-only-upgrade">
            <Alert
                variant="info"
                title="Pro Feature"
            >
                Upgrade to Pro to access this feature.
            </Alert>
        </div>
    );
}

interface FeatureLimitDisplayProps {
    current: number;
    limit: number;
    label: string;
    plan: Plan;
}

/**
 * Displays usage vs limit for a feature with visual progress.
 */
export function FeatureLimitDisplay({
    current,
    limit,
    label,
    plan,
}: FeatureLimitDisplayProps) {
    const percentage = limit === Infinity ? 0 : Math.min(100, (current / limit) * 100);
    const isAtLimit = limit !== Infinity && current >= limit;
    const displayLimit = limit === Infinity ? '∞' : limit.toString();

    return (
        <div className="feature-limit-display">
            <div className="feature-limit-header">
                <span className="feature-limit-label">{label}</span>
                <span className="feature-limit-count">
                    {current} / {displayLimit}
                </span>
            </div>
            <div className="feature-limit-progress">
                <div
                    className={`feature-limit-bar ${isAtLimit ? 'at-limit' : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isAtLimit && plan === 'BASIC' && (
                <p className="feature-limit-warning">
                    Limit reached. Upgrade to Pro for unlimited {label.toLowerCase()}.
                </p>
            )}
        </div>
    );
}
