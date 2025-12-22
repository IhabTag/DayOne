'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Alert } from '@/components/ui';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: {
        status: 'connected' | 'disconnected';
        latency: number;
    };
    sessions: {
        active: number;
        expired: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    uptime: number;
}

export default function AdminHealthPage() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        try {
            const response = await fetch('/api/admin/health');
            if (response.ok) {
                const data = await response.json();
                setHealth(data);
                setError(null);
            } else {
                setError('Failed to fetch health status');
            }
        } catch {
            setError('Failed to connect to health endpoint');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
        if (status === 'healthy' || status === 'connected') return 'success';
        if (status === 'degraded') return 'warning';
        return 'error';
    };

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
                <h1>System Health</h1>
                <p>Monitor system status and performance</p>
            </header>

            {error && (
                <Alert variant="error" className="mb-4">
                    {error}
                </Alert>
            )}

            {health && (
                <>
                    {/* Overall Status */}
                    <Card className={`admin-health-status-card ${health.status}`}>
                        <CardContent>
                            <div className="admin-health-overview">
                                <div className="admin-health-icon">
                                    {health.status === 'healthy' ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h2>System Status</h2>
                                    <Badge variant={getStatusVariant(health.status)}>
                                        {health.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="admin-health-uptime">
                                    <span>Uptime</span>
                                    <strong>{formatUptime(health.uptime)}</strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="admin-health-grid">
                        {/* Database */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Database</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="admin-health-item">
                                    <div className="admin-health-row">
                                        <span>Connection</span>
                                        <Badge variant={getStatusVariant(health.database.status)}>
                                            {health.database.status}
                                        </Badge>
                                    </div>
                                    <div className="admin-health-row">
                                        <span>Latency</span>
                                        <span className="admin-health-value">{health.database.latency}ms</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sessions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="admin-health-item">
                                    <div className="admin-health-row">
                                        <span>Active Sessions</span>
                                        <span className="admin-health-value">{health.sessions.active}</span>
                                    </div>
                                    <div className="admin-health-row">
                                        <span>Expired (cleanup pending)</span>
                                        <span className="admin-health-value">{health.sessions.expired}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Memory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Memory Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="admin-health-item">
                                    <div className="admin-health-row">
                                        <span>Used</span>
                                        <span className="admin-health-value">
                                            {Math.round(health.memory.used / 1024 / 1024)}MB
                                        </span>
                                    </div>
                                    <div className="admin-health-progress">
                                        <div
                                            className={`admin-health-bar ${health.memory.percentage > 80 ? 'warning' : ''}`}
                                            style={{ width: `${health.memory.percentage}%` }}
                                        />
                                    </div>
                                    <div className="admin-health-row">
                                        <span>Percentage</span>
                                        <span className="admin-health-value">{Math.round(health.memory.percentage)}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
