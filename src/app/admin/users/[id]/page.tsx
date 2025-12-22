'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Alert } from '@/components/ui';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'SUPERADMIN';
    status: 'ACTIVE' | 'DEACTIVATED';
    plan: 'BASIC' | 'PRO';
    planOverride: boolean;
    emailVerified: string | null;
    trialEndDate: string;
    createdAt: string;
}

interface AuditLog {
    id: string;
    action: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [userRes, logsRes] = await Promise.all([
                    fetch(`/api/admin/users/${id}`),
                    fetch(`/api/admin/users/${id}/audit-logs`),
                ]);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }

                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setAuditLogs(logsData.logs);
                }
            } catch {
                // Handle error
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleAction = async (action: string, data?: Record<string, unknown>) => {
        setActionLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...data }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: result.message || 'Action completed successfully' });
                // Refresh user data
                const userRes = await fetch(`/api/admin/users/${id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
            } else {
                setMessage({ type: 'error', text: result.message || 'Action failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="admin-page">
                <Alert variant="error">User not found</Alert>
                <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-header-row">
                    <div>
                        <h1>{user.name || user.email}</h1>
                        <p>{user.email}</p>
                    </div>
                    <Button variant="secondary" onClick={() => router.push('/admin/users')}>
                        ← Back to Users
                    </Button>
                </div>
            </header>

            {message && (
                <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <div className="admin-detail-grid">
                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="admin-detail-info">
                            <div className="admin-detail-row">
                                <span>User ID</span>
                                <code>{user.id}</code>
                            </div>
                            <div className="admin-detail-row">
                                <span>Email</span>
                                <span>{user.email}</span>
                            </div>
                            <div className="admin-detail-row">
                                <span>Name</span>
                                <span>{user.name || 'Not set'}</span>
                            </div>
                            <div className="admin-detail-row">
                                <span>Email Verified</span>
                                <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                            </div>
                            <div className="admin-detail-row">
                                <span>Joined</span>
                                <span>{new Date(user.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role & Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role & Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="admin-detail-info">
                            <div className="admin-detail-row">
                                <span>Role</span>
                                <Badge variant={user.role === 'SUPERADMIN' ? 'info' : 'default'}>
                                    {user.role === 'SUPERADMIN' ? 'Superadmin' : 'User'}
                                </Badge>
                            </div>
                            <div className="admin-detail-row">
                                <span>Status</span>
                                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>
                                    {user.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="admin-actions">
                            {user.role !== 'SUPERADMIN' && (
                                <Button
                                    variant="secondary"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changeRole', { role: 'SUPERADMIN' })}
                                >
                                    Make Admin
                                </Button>
                            )}
                            {user.role === 'SUPERADMIN' && (
                                <Button
                                    variant="secondary"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changeRole', { role: 'USER' })}
                                >
                                    Remove Admin
                                </Button>
                            )}
                            {user.status === 'ACTIVE' ? (
                                <Button
                                    variant="danger"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changeStatus', { status: 'DEACTIVATED' })}
                                >
                                    Deactivate
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changeStatus', { status: 'ACTIVE' })}
                                >
                                    Activate
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Plan & Trial */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plan & Trial</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="admin-detail-info">
                            <div className="admin-detail-row">
                                <span>Current Plan</span>
                                <Badge variant={user.plan === 'PRO' ? 'info' : 'default'}>
                                    {user.plan}
                                </Badge>
                            </div>
                            <div className="admin-detail-row">
                                <span>Plan Override</span>
                                <span>{user.planOverride ? 'Yes (Admin set)' : 'No (Trial-based)'}</span>
                            </div>
                            <div className="admin-detail-row">
                                <span>Trial End Date</span>
                                <span>{new Date(user.trialEndDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="admin-actions">
                            {user.plan === 'BASIC' ? (
                                <Button
                                    variant="primary"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changePlan', { plan: 'PRO' })}
                                >
                                    Upgrade to Pro
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    disabled={actionLoading}
                                    onClick={() => handleAction('changePlan', { plan: 'BASIC' })}
                                >
                                    Downgrade to Basic
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                disabled={actionLoading}
                                onClick={() => handleAction('extendTrial', { days: 14 })}
                            >
                                Extend Trial (+14 days)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log */}
                <Card className="admin-card-full">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {auditLogs.length === 0 ? (
                            <p className="admin-empty">No activity recorded</p>
                        ) : (
                            <div className="admin-timeline">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="admin-timeline-item">
                                        <div className="admin-timeline-dot" />
                                        <div className="admin-timeline-content">
                                            <div className="admin-timeline-action">{log.action}</div>
                                            <div className="admin-timeline-time">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
