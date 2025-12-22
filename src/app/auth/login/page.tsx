'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNeedsVerification(false);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'EMAIL_NOT_VERIFIED') {
                    setNeedsVerification(true);
                    setError('Please verify your email before logging in.');
                } else {
                    setError(data.message || 'Login failed');
                }
                return;
            }

            router.push(redirect);
            router.refresh();
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setError('');
                setNeedsVerification(false);
                alert('Verification email sent! Please check your inbox.');
            }
        } catch {
            // Silently fail to prevent enumeration
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="error" className="mb-4">
                        {error}
                        {needsVerification && (
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                className="auth-resend-link"
                                disabled={loading}
                            >
                                Resend verification email
                            </button>
                        )}
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <div className="form-label-row">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <Link href="/auth/forgot-password" className="form-link">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
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
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="auth-footer-links">
                <p>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="auth-link">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

function LoginFormFallback() {
    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="auth-form">
                    <div className="form-group">
                        <div className="form-label">Email</div>
                        <div className="skeleton-input" />
                    </div>
                    <div className="form-group">
                        <div className="form-label">Password</div>
                        <div className="skeleton-input" />
                    </div>
                    <div className="skeleton-button" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
        </Suspense>
    );
}

