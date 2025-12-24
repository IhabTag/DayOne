'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert, Select, GoogleButton } from '@/components/ui';

const REFERRAL_SOURCE_OPTIONS = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'google', label: 'Google' },
    { value: 'friend', label: 'Friend Recommendation' },
    { value: 'other', label: 'Other' },
];

const JOB_FUNCTION_OPTIONS = [
    { value: 'product_management', label: 'Product Management' },
    { value: 'software_engineering', label: 'Software Engineering' },
    { value: 'ai_engineering', label: 'AI Engineering' },
    { value: 'executive', label: 'Executive' },
    { value: 'other', label: 'Other' },
];

export default function SignupPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralSource: '',
        referralSourceOther: '',
        jobFunction: '',
        jobFunctionOther: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);

    // Fetch auth configuration on mount
    useEffect(() => {
        fetch('/api/auth/config')
            .then(res => res.json())
            .then(data => {
                setGoogleOAuthEnabled(data.googleOAuthEnabled);
            })
            .catch(() => {
                // Silently fail - Google OAuth just won't be shown
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Clear the "Other" field if a non-other option is selected
            ...(name === 'referralSource' && value !== 'other' ? { referralSourceOther: '' } : {}),
            ...(name === 'jobFunction' && value !== 'other' ? { jobFunctionOther: '' } : {}),
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

        if (!formData.referralSource) {
            setError('Please tell us where you heard about us');
            setLoading(false);
            return;
        }

        if (formData.referralSource === 'other' && !formData.referralSourceOther.trim()) {
            setError('Please specify where you heard about us');
            setLoading(false);
            return;
        }

        if (!formData.jobFunction) {
            setError('Please select your job function');
            setLoading(false);
            return;
        }

        if (formData.jobFunction === 'other' && !formData.jobFunctionOther.trim()) {
            setError('Please specify your job function');
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
                    referralSource: formData.referralSource,
                    referralSourceOther: formData.referralSource === 'other' ? formData.referralSourceOther : undefined,
                    jobFunction: formData.jobFunction,
                    jobFunctionOther: formData.jobFunction === 'other' ? formData.jobFunctionOther : undefined,
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

                {/* Google OAuth Button - only shown when enabled */}
                {googleOAuthEnabled && (
                    <>
                        <GoogleButton disabled={loading} />
                        <div className="auth-divider">
                            <span>or sign up with email</span>
                        </div>
                    </>
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
                    <div className="form-group">
                        <label htmlFor="referralSource" className="form-label">
                            Where did you hear about us?
                        </label>
                        <Select
                            id="referralSource"
                            name="referralSource"
                            value={formData.referralSource}
                            onChange={handleSelectChange}
                            options={REFERRAL_SOURCE_OPTIONS}
                            placeholder="Select an option"
                            required
                            disabled={loading}
                        />
                    </div>
                    {formData.referralSource === 'other' && (
                        <div className="form-group">
                            <label htmlFor="referralSourceOther" className="form-label">
                                Please specify
                            </label>
                            <Input
                                id="referralSourceOther"
                                name="referralSourceOther"
                                type="text"
                                value={formData.referralSourceOther}
                                onChange={handleChange}
                                placeholder="Where did you hear about us?"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="jobFunction" className="form-label">
                            What is your job function?
                        </label>
                        <Select
                            id="jobFunction"
                            name="jobFunction"
                            value={formData.jobFunction}
                            onChange={handleSelectChange}
                            options={JOB_FUNCTION_OPTIONS}
                            placeholder="Select your role"
                            required
                            disabled={loading}
                        />
                    </div>
                    {formData.jobFunction === 'other' && (
                        <div className="form-group">
                            <label htmlFor="jobFunctionOther" className="form-label">
                                Please specify
                            </label>
                            <Input
                                id="jobFunctionOther"
                                name="jobFunctionOther"
                                type="text"
                                value={formData.jobFunctionOther}
                                onChange={handleChange}
                                placeholder="Your job function"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}
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

