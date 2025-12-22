'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '@/components/ui';

export default function SignupPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

        // Client-side validation
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
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Signup failed');
                return;
            }

            setSuccess(true);
            // Redirect to verification pending page after a brief delay
            setTimeout(() => {
                router.push('/auth/verify-email/pending');
            }, 2000);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="auth-card">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent you a verification link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="success">
                        Account created successfully! Please check your email to verify your account.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                    Start your 14-day free Pro trial today
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
                            required
                            autoComplete="name"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
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
                            Confirm Password
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
                        {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>
                <p className="auth-terms">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="auth-link">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="auth-link">
                        Privacy Policy
                    </Link>
                </p>
            </CardContent>
            <CardFooter className="auth-footer-links">
                <p>
                    Already have an account?{' '}
                    <Link href="/auth/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
