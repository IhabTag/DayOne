'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, PlanStatusCard, Badge } from '@/components/ui';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'SUPERADMIN';
    plan: 'BASIC' | 'PRO';
    planOverride: boolean;
    trialEndDate: string;
    emailVerified: string | null;
    createdAt: string;
}

interface TrialInfo {
    isOnTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setTrialInfo(data.trial);
                }
            } catch {
                // Handle error silently
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!</h1>
                <p>Here&apos;s an overview of your DayOne account.</p>
            </header>

            <div className="dashboard-grid">
                {/* Plan Status */}
                <div className="dashboard-card-wide">
                    {trialInfo && (
                        <PlanStatusCard
                            isOnTrial={trialInfo.isOnTrial}
                            isExpired={trialInfo.isExpired}
                            daysRemaining={trialInfo.daysRemaining}
                            plan={user.plan}
                            planOverride={user.planOverride}
                        />
                    )}
                </div>

                {/* Account Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="dashboard-stats">
                            <div className="dashboard-stat">
                                <span className="dashboard-stat-label">Email</span>
                                <span className="dashboard-stat-value">{user.email}</span>
                            </div>
                            <div className="dashboard-stat">
                                <span className="dashboard-stat-label">Verified</span>
                                <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                                    {user.emailVerified ? 'Verified' : 'Pending'}
                                </Badge>
                            </div>
                            <div className="dashboard-stat">
                                <span className="dashboard-stat-label">Role</span>
                                <Badge variant={user.role === 'SUPERADMIN' ? 'info' : 'default'}>
                                    {user.role === 'SUPERADMIN' ? 'Admin' : 'User'}
                                </Badge>
                            </div>
                            <div className="dashboard-stat">
                                <span className="dashboard-stat-label">Member since</span>
                                <span className="dashboard-stat-value">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Getting Started */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="dashboard-getting-started">
                            <p className="dashboard-getting-started-intro">
                                Welcome to DayOne! This starter kit includes everything you need to build your SaaS.
                            </p>
                            <ul className="dashboard-checklist">
                                <li className="dashboard-checklist-item completed">
                                    <svg className="checklist-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Authentication with Google OAuth</span>
                                </li>
                                <li className="dashboard-checklist-item completed">
                                    <svg className="checklist-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Subscription & trial system active</span>
                                </li>
                                <li className="dashboard-checklist-item completed">
                                    <svg className="checklist-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Role-based access control enabled</span>
                                </li>
                                <li className="dashboard-checklist-item completed">
                                    <svg className="checklist-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>PostHog analytics ready</span>
                                </li>
                                <li className="dashboard-checklist-item">
                                    <svg className="checklist-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="10" cy="10" r="7" />
                                    </svg>
                                    <span>Add your first feature</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="dashboard-actions">
                            <Link href="/dashboard/profile" className="dashboard-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>Edit Profile</span>
                            </Link>
                            <Link href="/dashboard/settings" className="dashboard-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Settings</span>
                            </Link>
                            {user.plan === 'BASIC' && (
                                <Link href="/pricing" className="dashboard-action upgrade">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                    <span>Upgrade to Pro</span>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
