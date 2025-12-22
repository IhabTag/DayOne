'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function ConfirmEmailChangePage() {
    const params = useParams();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        const confirmEmailChange = async () => {
            try {
                const response = await fetch('/api/auth/confirm-email-change', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setNewEmail(data.newEmail || '');
                    setMessage('Your email has been changed successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Email change failed');
                }
            } catch {
                setStatus('error');
                setMessage('An unexpected error occurred');
            }
        };

        if (token) {
            confirmEmailChange();
        }
    }, [token]);

    return (
        <Card className="auth-card">
            {status === 'loading' && (
                <>
                    <CardHeader>
                        <CardTitle>Confirming email change</CardTitle>
                        <CardDescription>
                            Please wait while we update your email
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="auth-loading">
                        <div className="loading-spinner" />
                        <p>Processing...</p>
                    </CardContent>
                </>
            )}

            {status === 'success' && (
                <>
                    <CardHeader>
                        <CardTitle>Email updated!</CardTitle>
                        <CardDescription>
                            Your email address has been changed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="success">{message}</Alert>
                        {newEmail && (
                            <p className="auth-help-text">
                                Your new email is: <strong>{newEmail}</strong>
                            </p>
                        )}
                        <p className="auth-help-text">
                            You may need to log in again with your new email.
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
                        <CardTitle>Email change failed</CardTitle>
                        <CardDescription>
                            We couldn&apos;t update your email
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="error">{message}</Alert>
                        <p className="auth-help-text">
                            The confirmation link may have expired or already been used.
                        </p>
                    </CardContent>
                    <CardFooter className="auth-footer-links">
                        <Link href="/dashboard/settings" className="auth-link">
                            Try again from settings
                        </Link>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
