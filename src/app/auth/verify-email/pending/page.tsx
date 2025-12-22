'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function VerifyEmailPendingPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            // Always show success to prevent enumeration
            setSent(true);
        } catch {
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                    We&apos;ve sent a verification link to your email
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="verify-pending-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </div>
                <p className="verify-pending-text">
                    Please check your inbox and click the verification link to activate your account.
                </p>

                {sent ? (
                    <Alert variant="success" className="mt-4">
                        If an account exists with that email, a new verification link has been sent.
                    </Alert>
                ) : (
                    <div className="verify-resend-section">
                        <p className="verify-resend-label">
                            Didn&apos;t receive the email?
                        </p>
                        <form onSubmit={handleResend} className="verify-resend-form">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                disabled={loading || !email}
                            >
                                {loading ? 'Sending...' : 'Resend'}
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
            <CardFooter className="auth-footer-links">
                <Link href="/auth/login" className="auth-link">
                    ← Back to login
                </Link>
            </CardFooter>
        </Card>
    );
}
