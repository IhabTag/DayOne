'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, Input, Button, Badge } from '@/components/ui';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'SUPERADMIN';
    status: 'ACTIVE' | 'DEACTIVATED';
    plan: 'BASIC' | 'PRO';
    emailVerified: string | null;
    createdAt: string;
    authProviders: string[];
}

interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [planFilter, setPlanFilter] = useState<string>('');
    const [providerFilter, setProviderFilter] = useState<string>('');
    const limit = 10;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            if (statusFilter) params.set('status', statusFilter);
            if (planFilter) params.set('plan', planFilter);
            if (providerFilter) params.set('provider', providerFilter);

            const response = await fetch(`/api/admin/users?${params}`);
            if (response.ok) {
                const data: UsersResponse = await response.json();
                setUsers(data.users);
                setTotal(data.total);
            }
        } catch {
            // Handle error
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter, statusFilter, planFilter, providerFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>User Management</h1>
                <p>View and manage all users</p>
            </header>

            <Card>
                <CardContent>
                    {/* Filters */}
                    <form onSubmit={handleSearch} className="admin-filters">
                        <div className="admin-filters-row">
                            <Input
                                type="text"
                                placeholder="Search by email or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="admin-search"
                            />
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </div>
                        <div className="admin-filters-row">
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Roles</option>
                                <option value="USER">User</option>
                                <option value="SUPERADMIN">Superadmin</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="DEACTIVATED">Deactivated</option>
                            </select>
                            <select
                                value={planFilter}
                                onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Plans</option>
                                <option value="BASIC">Basic</option>
                                <option value="PRO">Pro</option>
                            </select>
                            <select
                                value={providerFilter}
                                onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Auth Methods</option>
                                <option value="PASSWORD_ONLY">Password Only</option>
                                <option value="GOOGLE">Google</option>
                            </select>
                        </div>
                    </form>

                    {/* Users Table */}
                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner" />
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Auth</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Plan</th>
                                            <th>Verified</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="admin-table-empty">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="admin-user-cell">
                                                            <div className="admin-user-avatar-small">
                                                                {user.name?.charAt(0) || user.email.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="admin-user-name">
                                                                    {user.name || 'No name'}
                                                                </div>
                                                                <div className="admin-user-email">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="admin-auth-badges">
                                                            {user.authProviders.map((p) => (
                                                                <Badge key={p} variant="default" className="admin-badge-small">
                                                                    {p === 'password' ? '🔑' : p === 'google' ? '🔵' : '•'} {p}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge variant={user.role === 'SUPERADMIN' ? 'info' : 'default'}>
                                                            {user.role === 'SUPERADMIN' ? 'Admin' : 'User'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>
                                                            {user.status === 'ACTIVE' ? 'Active' : 'Deactivated'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge variant={user.plan === 'PRO' ? 'info' : 'default'}>
                                                            {user.plan}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {user.emailVerified ? (
                                                            <span className="admin-verified">✓</span>
                                                        ) : (
                                                            <span className="admin-unverified">✗</span>
                                                        )}
                                                    </td>
                                                    <td className="admin-date">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            href={`/admin/users/${user.id}`}
                                                            className="admin-action-link"
                                                        >
                                                            View
                                                        </Link>
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
                                        Page {page} of {totalPages} ({total} users)
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
