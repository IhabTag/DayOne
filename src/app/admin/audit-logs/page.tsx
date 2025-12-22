'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Input, Button, Badge } from '@/components/ui';

interface AuditLog {
    id: string;
    userId: string | null;
    actorId: string | null;
    action: string;
    entityType: string | null;
    entityId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    user?: {
        id: string;
        email: string;
        name: string | null;
    };
}

interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const limit = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (actionFilter) params.set('action', actionFilter);
            if (userSearch) params.set('userId', userSearch);

            const response = await fetch(`/api/admin/audit-logs?${params}`);
            if (response.ok) {
                const data: AuditLogsResponse = await response.json();
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch {
            // Handle error
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter, userSearch]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const getActionColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
        if (action.includes('login.success') || action.includes('verified')) return 'success';
        if (action.includes('failure') || action.includes('deleted')) return 'error';
        if (action.includes('changed') || action.includes('updated')) return 'warning';
        if (action.includes('signup') || action.includes('created')) return 'info';
        return 'default';
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Audit Logs</h1>
                <p>Complete activity history across the system</p>
            </header>

            <Card>
                <CardContent>
                    {/* Filters */}
                    <form onSubmit={handleSearch} className="admin-filters">
                        <div className="admin-filters-row">
                            <Input
                                type="text"
                                placeholder="Filter by user ID..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="admin-search"
                            />
                            <select
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Actions</option>
                                <option value="user.signup">User Signup</option>
                                <option value="user.login">User Login</option>
                                <option value="user.logout">User Logout</option>
                                <option value="user.email">Email Actions</option>
                                <option value="user.password">Password Actions</option>
                                <option value="user.role">Role Changes</option>
                                <option value="user.status">Status Changes</option>
                                <option value="user.plan">Plan Changes</option>
                            </select>
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                        </div>
                    </form>

                    {/* Logs Table */}
                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner" />
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-container">
                                <table className="admin-table audit-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Action</th>
                                            <th>User</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="admin-table-empty">
                                                    No audit logs found
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="admin-date">
                                                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                                                        <div className="admin-time">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                                    </td>
                                                    <td>
                                                        <Badge variant={getActionColor(log.action)}>
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {log.user ? (
                                                            <div className="admin-user-cell">
                                                                <div className="admin-user-name">{log.user.name || 'No name'}</div>
                                                                <div className="admin-user-email">{log.user.email}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="admin-muted">System</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                            <code className="admin-metadata">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </code>
                                                        ) : (
                                                            <span className="admin-muted">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="admin-pagination">
                                    <Button
                                        variant="secondary"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="admin-pagination-info">
                                        Page {page} of {totalPages} ({total} logs)
                                    </span>
                                    <Button
                                        variant="secondary"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
