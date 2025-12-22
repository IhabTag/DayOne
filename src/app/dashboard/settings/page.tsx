'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Alert } from '@/components/ui';

interface User {
    id: string;
    name: string | null;
    email: string;
    plan: 'BASIC' | 'PRO';
    emailVerified: string | null;
}

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    // Change Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Change Email State
    const [emailData, setEmailData] = useState({ newEmail: '' });
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch {
                // Handle error silently
            }
        };

        fetchUser();
    }, []);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setPasswordSuccess(false);
        setPasswordError('');
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess(false);
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            setPasswordSuccess(true);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setEmailSuccess(false);
        setEmailError('');
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailSuccess(false);
        setEmailError('');

        try {
            const response = await fetch('/api/auth/change-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: emailData.newEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change email');
            }

            setEmailSuccess(true);
            setEmailData({ newEmail: '' });
        } catch (err) {
            setEmailError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setEmailLoading(false);
        }
    };

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
                <h1>Settings</h1>
                <p>Manage your account security and preferences</p>
            </header>

            <div className="settings-grid">
                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {passwordSuccess && (
                            <Alert variant="success" className="mb-4">
                                Password changed successfully!
                            </Alert>
                        )}
                        {passwordError && (
                            <Alert variant="error" className="mb-4">
                                {passwordError}
                            </Alert>
                        )}
                        <form onSubmit={handlePasswordSubmit} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword" className="form-label">
                                    Current Password
                                </label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={passwordLoading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">
                                    New Password
                                </label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={passwordLoading}
                                />
                                <p className="form-hint">Must be at least 8 characters</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm New Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={passwordLoading}
                                />
                            </div>
                            <Button type="submit" variant="primary" disabled={passwordLoading}>
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Email */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Email</CardTitle>
                        <CardDescription>
                            Update your email address. You&apos;ll need to verify the new address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!user.emailVerified && (
                            <Alert variant="warning" className="mb-4">
                                Please verify your current email before changing it.
                            </Alert>
                        )}
                        {emailSuccess && (
                            <Alert variant="success" className="mb-4">
                                Verification email sent! Please check your new email address.
                            </Alert>
                        )}
                        {emailError && (
                            <Alert variant="error" className="mb-4">
                                {emailError}
                            </Alert>
                        )}
                        <div className="settings-info mb-4">
                            <div className="settings-info-row">
                                <span className="settings-info-label">Current Email</span>
                                <span className="settings-info-value">{user.email}</span>
                            </div>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="newEmail" className="form-label">
                                    New Email Address
                                </label>
                                <Input
                                    id="newEmail"
                                    name="newEmail"
                                    type="email"
                                    value={emailData.newEmail}
                                    onChange={handleEmailChange}
                                    placeholder="newemail@example.com"
                                    required
                                    disabled={emailLoading || !user.emailVerified}
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={emailLoading || !user.emailVerified}
                            >
                                {emailLoading ? 'Sending...' : 'Change Email'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="settings-danger">
                    <CardHeader>
                        <CardTitle>Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="settings-danger-item">
                            <div>
                                <h4>Delete Account</h4>
                                <p>Permanently delete your account and all associated data.</p>
                            </div>
                            <Button variant="danger">
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
