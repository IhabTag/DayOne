'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // Always show success to prevent email enumeration
            setSubmitted(true);
        } catch {
            // Silently handle errors to prevent enumeration
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="auth-card">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent password reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="success">
                        If an account exists with that email, you&apos;ll receive a password reset link shortly.
                    </Alert>
                    <p className="auth-help-text">
                        Didn&apos;t receive the email? Check your spam folder or{' '}
                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="auth-link"
                        >
                            try again
                        </button>
                    </p>
                </CardContent>
                <CardFooter className="auth-footer-links">
                    <Link href="/auth/login" className="auth-link">
                        ← Back to login
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send reset link'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="auth-footer-links">
                <p>
                    Remember your password?{' '}
                    <Link href="/auth/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
