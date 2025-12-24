'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Input, Button, Badge, Alert } from '@/components/ui';

interface ReferralLink {
    id: string;
    slug: string;
    displayName: string | null;
    trialDays: number;
    isActive: boolean;
    createdAt: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    signupCount: number;
    lastSignupAt: string | null;
}

interface ReferralLinksResponse {
    referralLinks: ReferralLink[];
    total: number;
    page: number;
    limit: number;
}

export default function AdminReferralLinksPage() {
    const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState<ReferralLink | null>(null);
    const limit = 10;

    const fetchReferralLinks = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/admin/referral-links?${params}`);
            if (response.ok) {
                const data: ReferralLinksResponse = await response.json();
                setReferralLinks(data.referralLinks);
                setTotal(data.total);
            }
        } catch {
            // Handle error
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchReferralLinks();
    }, [fetchReferralLinks]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchReferralLinks();
    };

    const handleToggleActive = async (link: ReferralLink) => {
        try {
            const response = await fetch(`/api/admin/referral-links/${link.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !link.isActive }),
            });

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: `Referral link ${link.isActive ? 'disabled' : 'enabled'} successfully`,
                });
                fetchReferralLinks();
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.message || 'Failed to update referral link' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleCopyLink = async (slug: string) => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const url = `${appUrl}/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setMessage({ type: 'success', text: 'Link copied to clipboard!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to copy link' });
        }
    };

    const handleCreateOrEdit = (link: ReferralLink | null = null) => {
        setEditingLink(link);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingLink(null);
    };

    const handleModalSave = async (formData: {
        slug: string;
        displayName: string;
        trialDays: number;
        isActive: boolean;
    }) => {
        try {
            const url = editingLink
                ? `/api/admin/referral-links/${editingLink.id}`
                : '/api/admin/referral-links';
            const method = editingLink ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    displayName: formData.displayName || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: editingLink
                        ? 'Referral link updated successfully'
                        : 'Referral link created successfully',
                });
                handleModalClose();
                fetchReferralLinks();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to save referral link' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-header-row">
                    <div>
                        <h1>Referral Links</h1>
                        <p>Manage referral links with custom trial periods</p>
                    </div>
                    <Button onClick={() => handleCreateOrEdit()}>
                        Create Referral Link
                    </Button>
                </div>
            </header>

            {message && (
                <Alert
                    variant={message.type === 'success' ? 'success' : 'error'}
                    className="mb-4"
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <Card>
                <CardContent>
                    {/* Filters */}
                    <form onSubmit={handleSearch} className="admin-filters">
                        <div className="admin-filters-row">
                            <Input
                                type="text"
                                placeholder="Search by slug or display name..."
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
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </form>

                    {/* Referral Links Table */}
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
                                            <th>Slug</th>
                                            <th>Display Name</th>
                                            <th>Trial Days</th>
                                            <th>Status</th>
                                            <th>Signups</th>
                                            <th>Last Signup</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralLinks.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="admin-table-empty">
                                                    No referral links found
                                                </td>
                                            </tr>
                                        ) : (
                                            referralLinks.map((link) => (
                                                <tr key={link.id}>
                                                    <td>
                                                        <code className="admin-slug">{link.slug}</code>
                                                    </td>
                                                    <td>{link.displayName || '—'}</td>
                                                    <td><strong>{link.trialDays}</strong> days</td>
                                                    <td>
                                                        <Badge variant={link.isActive ? 'success' : 'error'}>
                                                            {link.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td>{link.signupCount}</td>
                                                    <td className="admin-date">
                                                        {link.lastSignupAt
                                                            ? new Date(link.lastSignupAt).toLocaleDateString()
                                                            : '—'}
                                                    </td>
                                                    <td className="admin-date">
                                                        {new Date(link.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="admin-actions-row">
                                                            <button
                                                                className="admin-action-btn"
                                                                onClick={() => handleCreateOrEdit(link)}
                                                                title="Edit"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="admin-action-btn"
                                                                onClick={() => handleToggleActive(link)}
                                                                title={link.isActive ? 'Disable' : 'Enable'}
                                                            >
                                                                {link.isActive ? 'Disable' : 'Enable'}
                                                            </button>
                                                            <button
                                                                className="admin-action-btn"
                                                                onClick={() => handleCopyLink(link.slug)}
                                                                title="Copy Link"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
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
                                        Page {page} of {totalPages} ({total} links)
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

            {/* Create/Edit Modal */}
            {showModal && (
                <ReferralLinkModal
                    link={editingLink}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
}

// Modal Component
function ReferralLinkModal({
    link,
    onClose,
    onSave,
}: {
    link: ReferralLink | null;
    onClose: () => void;
    onSave: (data: { slug: string; displayName: string; trialDays: number; isActive: boolean }) => void;
}) {
    const [slug, setSlug] = useState(link?.slug || '');
    const [displayName, setDisplayName] = useState(link?.displayName || '');
    const [trialDays, setTrialDays] = useState(link?.trialDays || 14);
    const [isActive, setIsActive] = useState(link?.isActive ?? true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
            newErrors.slug = 'Slug can only contain letters, numbers, underscores, and hyphens';
        }

        if (trialDays < 1 || trialDays > 365) {
            newErrors.trialDays = 'Trial days must be between 1 and 365';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        await onSave({ slug, displayName, trialDays, isActive });
        setSaving(false);
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{link ? 'Edit Referral Link' : 'Create Referral Link'}</h2>
                    <button className="admin-modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="form-group">
                            <label htmlFor="slug">Slug *</label>
                            <Input
                                id="slug"
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g., johndoe"
                            />
                            {link && (
                                <p className="form-hint warning">
                                    ⚠️ Changing the slug will change the referral URL
                                </p>
                            )}
                            {errors.slug && <p className="form-error">{errors.slug}</p>}
                            <p className="form-hint">
                                URL: {window.location.origin}/{slug || 'your-slug'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <Input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g., John Doe's Referral"
                            />
                            <p className="form-hint">
                                Optional name shown on signup page
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="trialDays">Trial Days *</label>
                            <Input
                                id="trialDays"
                                type="number"
                                value={trialDays}
                                onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                                min={1}
                                max={365}
                            />
                            {errors.trialDays && <p className="form-error">{errors.trialDays}</p>}
                            <p className="form-hint">
                                Users registering via this link get {trialDays} days of Pro trial
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>Active</span>
                            </label>
                            <p className="form-hint">
                                Inactive links will not set referral cookies
                            </p>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : (link ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
