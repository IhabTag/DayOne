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
                        timezone: data.user.timezone || 'Africa/Cairo',
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
        // Africa
        'Africa/Abidjan',
        'Africa/Accra',
        'Africa/Addis_Ababa',
        'Africa/Algiers',
        'Africa/Cairo',
        'Africa/Casablanca',
        'Africa/Johannesburg',
        'Africa/Lagos',
        'Africa/Nairobi',
        'Africa/Tunis',
        // America
        'America/Anchorage',
        'America/Argentina/Buenos_Aires',
        'America/Bogota',
        'America/Chicago',
        'America/Denver',
        'America/Halifax',
        'America/Lima',
        'America/Los_Angeles',
        'America/Mexico_City',
        'America/New_York',
        'America/Phoenix',
        'America/Santiago',
        'America/Sao_Paulo',
        'America/Toronto',
        'America/Vancouver',
        // Asia
        'Asia/Baghdad',
        'Asia/Bangkok',
        'Asia/Beirut',
        'Asia/Dhaka',
        'Asia/Dubai',
        'Asia/Ho_Chi_Minh',
        'Asia/Hong_Kong',
        'Asia/Istanbul',
        'Asia/Jakarta',
        'Asia/Jerusalem',
        'Asia/Karachi',
        'Asia/Kolkata',
        'Asia/Kuala_Lumpur',
        'Asia/Kuwait',
        'Asia/Manila',
        'Asia/Riyadh',
        'Asia/Seoul',
        'Asia/Shanghai',
        'Asia/Singapore',
        'Asia/Taipei',
        'Asia/Tehran',
        'Asia/Tokyo',
        // Atlantic
        'Atlantic/Azores',
        'Atlantic/Reykjavik',
        // Australia
        'Australia/Adelaide',
        'Australia/Brisbane',
        'Australia/Melbourne',
        'Australia/Perth',
        'Australia/Sydney',
        // Europe
        'Europe/Amsterdam',
        'Europe/Athens',
        'Europe/Berlin',
        'Europe/Brussels',
        'Europe/Budapest',
        'Europe/Copenhagen',
        'Europe/Dublin',
        'Europe/Helsinki',
        'Europe/Lisbon',
        'Europe/London',
        'Europe/Madrid',
        'Europe/Moscow',
        'Europe/Oslo',
        'Europe/Paris',
        'Europe/Prague',
        'Europe/Rome',
        'Europe/Stockholm',
        'Europe/Vienna',
        'Europe/Warsaw',
        'Europe/Zurich',
        // Pacific
        'Pacific/Auckland',
        'Pacific/Fiji',
        'Pacific/Guam',
        'Pacific/Honolulu',
        // UTC
        'UTC',
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
