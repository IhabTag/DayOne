'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    proUsers: number;
    basicUsers: number;
    usersOnTrial: number;
    recentSignups: number;
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch {
                // Handle error
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Admin Overview</h1>
                <p>System statistics and quick actions</p>
            </header>

            <div className="admin-stats-grid">
                <Card className="admin-stat-card">
                    <CardContent>
                        <div className="admin-stat">
                            <div className="admin-stat-icon users">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="admin-stat-content">
                                <div className="admin-stat-value">{stats?.totalUsers ?? 0}</div>
                                <div className="admin-stat-label">Total Users</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="admin-stat-card">
                    <CardContent>
                        <div className="admin-stat">
                            <div className="admin-stat-icon active">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div className="admin-stat-content">
                                <div className="admin-stat-value">{stats?.activeUsers ?? 0}</div>
                                <div className="admin-stat-label">Active Users</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="admin-stat-card">
                    <CardContent>
                        <div className="admin-stat">
                            <div className="admin-stat-icon pro">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <div className="admin-stat-content">
                                <div className="admin-stat-value">{stats?.proUsers ?? 0}</div>
                                <div className="admin-stat-label">Pro Users</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="admin-stat-card">
                    <CardContent>
                        <div className="admin-stat">
                            <div className="admin-stat-icon trial">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="admin-stat-content">
                                <div className="admin-stat-value">{stats?.usersOnTrial ?? 0}</div>
                                <div className="admin-stat-label">On Trial</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="admin-grid">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="admin-quick-actions">
                            <a href="/admin/users" className="admin-quick-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                <span>Manage Users</span>
                            </a>
                            <a href="/admin/audit-logs" className="admin-quick-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span>View Audit Logs</span>
                            </a>
                            <a href="/admin/health" className="admin-quick-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                <span>System Health</span>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="admin-plan-stats">
                            <div className="admin-plan-stat">
                                <div className="admin-plan-info">
                                    <Badge variant="info">Pro</Badge>
                                    <span className="admin-plan-count">{stats?.proUsers ?? 0} users</span>
                                </div>
                                <div className="admin-plan-bar">
                                    <div
                                        className="admin-plan-fill pro"
                                        style={{
                                            width: `${stats?.totalUsers ? (stats.proUsers / stats.totalUsers) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="admin-plan-stat">
                                <div className="admin-plan-info">
                                    <Badge variant="default">Basic</Badge>
                                    <span className="admin-plan-count">{stats?.basicUsers ?? 0} users</span>
                                </div>
                                <div className="admin-plan-bar">
                                    <div
                                        className="admin-plan-fill basic"
                                        style={{
                                            width: `${stats?.totalUsers ? (stats.basicUsers / stats.totalUsers) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
