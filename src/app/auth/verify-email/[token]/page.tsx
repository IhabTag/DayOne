'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function VerifyEmailPage() {
    const params = useParams();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch {
                setStatus('error');
                setMessage('An unexpected error occurred');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <Card className="auth-card">
            {status === 'loading' && (
                <>
                    <CardHeader>
                        <CardTitle>Verifying your email</CardTitle>
                        <CardDescription>
                            Please wait while we verify your email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="auth-loading">
                        <div className="loading-spinner" />
                        <p>Verifying...</p>
                    </CardContent>
                </>
            )}

            {status === 'success' && (
                <>
                    <CardHeader>
                        <CardTitle>Email verified!</CardTitle>
                        <CardDescription>
                            Your account is now fully activated
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="success">{message}</Alert>
                        <p className="auth-help-text">
                            You can now access all features of your account.
                        </p>
                    </CardContent>
                    <CardFooter className="auth-footer-links">
                        <Link href="/auth/login" className="auth-link">
                            Continue to login →
                        </Link>
                    </CardFooter>
                </>
            )}

            {status === 'error' && (
                <>
                    <CardHeader>
                        <CardTitle>Verification failed</CardTitle>
                        <CardDescription>
                            We couldn&apos;t verify your email
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="error">{message}</Alert>
                        <p className="auth-help-text">
                            The verification link may have expired or already been used.
                        </p>
                    </CardContent>
                    <CardFooter className="auth-footer-links">
                        <Link href="/auth/login" className="auth-link">
                            Go to login
                        </Link>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
