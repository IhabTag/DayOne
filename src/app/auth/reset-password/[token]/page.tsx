'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        // Validate token on mount
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/auth/reset-password?token=${token}`);
                setTokenValid(response.ok);
            } catch {
                setTokenValid(false);
            }
        };

        if (token) {
            validateToken();
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to reset password');
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Loading state while validating token
    if (tokenValid === null) {
        return (
            <Card className="auth-card">
                <CardContent className="auth-loading">
                    <div className="loading-spinner" />
                    <p>Validating reset link...</p>
                </CardContent>
            </Card>
        );
    }

    // Invalid or expired token
    if (!tokenValid) {
        return (
            <Card className="auth-card">
                <CardHeader>
                    <CardTitle>Invalid or expired link</CardTitle>
                    <CardDescription>
                        This password reset link is no longer valid
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="error">
                        The password reset link has expired or is invalid. Please request a new one.
                    </Alert>
                </CardContent>
                <CardFooter className="auth-footer-links">
                    <Link href="/auth/forgot-password" className="auth-link">
                        Request new reset link
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    // Success state
    if (success) {
        return (
            <Card className="auth-card">
                <CardHeader>
                    <CardTitle>Password reset successful</CardTitle>
                    <CardDescription>
                        Your password has been updated
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="success">
                        Your password has been reset successfully. Redirecting you to login...
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Set new password</CardTitle>
                <CardDescription>
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="error" className="mb-4">
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            New Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            disabled={loading}
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
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
