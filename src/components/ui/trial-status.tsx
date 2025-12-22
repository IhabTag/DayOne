'use client';

import { Alert } from '@/components/ui';
import { Badge } from '@/components/ui';

interface TrialStatusProps {
    isOnTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
    plan: 'BASIC' | 'PRO';
    planOverride: boolean;
}

export function TrialStatusBanner({
    isOnTrial,
    isExpired,
    daysRemaining,
    plan,
    planOverride,
}: TrialStatusProps) {
    // Admin-set plan - no trial messaging
    if (planOverride) {
        return null;
    }

    // Show trial banner if on trial
    if (isOnTrial) {
        const urgency = daysRemaining <= 3 ? 'warning' : 'info';
        const message =
            daysRemaining === 1
                ? 'Your Pro trial ends tomorrow!'
                : daysRemaining === 0
                    ? 'Your Pro trial ends today!'
                    : `${daysRemaining} days left in your Pro trial`;

        return (
            <Alert
                variant={urgency}
                title="Trial Period"
                className="mb-4"
            >
                {message}
            </Alert>
        );
    }

    // Expired trial notification
    if (isExpired && plan === 'BASIC') {
        return (
            <Alert
                variant="info"
                title="Trial Ended"
                className="mb-4"
            >
                Your Pro trial has ended. You&apos;re now on the Basic plan.
            </Alert>
        );
    }

    return null;
}

export function TrialStatusBadge({
    isOnTrial,
    daysRemaining,
    plan,
    planOverride,
}: Omit<TrialStatusProps, 'isExpired'>) {
    if (planOverride) {
        return (
            <Badge variant={plan === 'PRO' ? 'info' : 'default'}>
                {plan === 'PRO' ? 'Pro' : 'Basic'}
            </Badge>
        );
    }

    if (isOnTrial) {
        return (
            <Badge variant={daysRemaining <= 3 ? 'warning' : 'info'}>
                Pro Trial ({daysRemaining}d left)
            </Badge>
        );
    }

    return (
        <Badge variant={plan === 'PRO' ? 'info' : 'default'}>
            {plan === 'PRO' ? 'Pro' : 'Basic'}
        </Badge>
    );
}

export function PlanStatusCard({
    isOnTrial,
    isExpired,
    daysRemaining,
    plan,
    planOverride,
}: TrialStatusProps) {
    return (
        <div className="plan-status-card">
            <div className="plan-status-header">
                <h3 className="plan-status-title">Current Plan</h3>
                <TrialStatusBadge
                    isOnTrial={isOnTrial}
                    daysRemaining={daysRemaining}
                    plan={plan}
                    planOverride={planOverride}
                />
            </div>
            <div className="plan-status-content">
                {planOverride ? (
                    <p className="plan-status-text">
                        Your plan has been set by an administrator.
                    </p>
                ) : isOnTrial ? (
                    <>
                        <p className="plan-status-text">
                            You&apos;re enjoying full Pro features during your trial period.
                        </p>
                        <div className="plan-status-progress">
                            <div className="plan-status-progress-bar">
                                <div
                                    className="plan-status-progress-fill"
                                    style={{
                                        width: `${Math.max(0, 100 - (daysRemaining / 14) * 100)}%`,
                                    }}
                                />
                            </div>
                            <span className="plan-status-days">
                                {daysRemaining} days remaining
                            </span>
                        </div>
                    </>
                ) : isExpired && plan === 'BASIC' ? (
                    <p className="plan-status-text">
                        Your trial has ended. Upgrade to Pro to unlock all features.
                    </p>
                ) : (
                    <p className="plan-status-text">
                        {plan === 'PRO'
                            ? 'You have access to all Pro features.'
                            : 'Upgrade to Pro to unlock advanced features.'}
                    </p>
                )}
            </div>
        </div>
    );
}
