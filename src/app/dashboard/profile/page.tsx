'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Alert, Badge } from '@/components/ui';

interface User {
    id: string;
    name: string | null;
    email: string;
    timezone: string;
    emailVerified: string | null;
    createdAt: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        timezone: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setFormData({
                        name: data.user.name || '',
                        timezone: data.user.timezone || 'UTC',
                    });
                }
            } catch {
                // Handle error silently
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setSuccess(false);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError('');

        try {
            const response = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const timezones = [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Dubai',
        'Australia/Sydney',
    ];

    if (!user) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="dashboard-header">
                <h1>Profile</h1>
                <p>Manage your personal information</p>
            </header>

            <div className="settings-grid">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {success && (
                            <Alert variant="success" className="mb-4">
                                Profile updated successfully!
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="error" className="mb-4">
                                {error}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="timezone" className="form-label">
                                    Timezone
                                </label>
                                <select
                                    id="timezone"
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className="settings-select"
                                    disabled={loading}
                                >
                                    {timezones.map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="settings-info">
                            <div className="settings-info-row">
                                <span className="settings-info-label">Email</span>
                                <span className="settings-info-value">{user.email}</span>
                            </div>
                            <div className="settings-info-row">
                                <span className="settings-info-label">Email Status</span>
                                <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                                </Badge>
                            </div>
                            <div className="settings-info-row">
                                <span className="settings-info-label">Member Since</span>
                                <span className="settings-info-value">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
