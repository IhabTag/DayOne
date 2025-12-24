'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    name: string | null;
    email: string;
}

export default function PublicHeader() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <nav className="landing-nav">
            <div className="landing-nav-container">
                <Link href="/" className="landing-logo">
                    <svg
                        className="landing-logo-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12 22V12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M12 12L4 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M12 12l8-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="8" r="2" fill="currentColor" />
                    </svg>
                    <span>DayOne</span>
                </Link>
                <div className="landing-nav-links">
                    <Link href="/pricing" className="landing-nav-link">
                        Pricing
                    </Link>
                    {loading ? (
                        <span className="landing-nav-link" style={{ opacity: 0.5 }}>
                            ...
                        </span>
                    ) : user ? (
                        <>
                            <Link href="/dashboard" className="landing-nav-link">
                                Dashboard
                            </Link>
                            <Link href="/dashboard" className="landing-nav-cta">
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="landing-nav-link">
                                Log in
                            </Link>
                            <Link href="/auth/signup" className="landing-nav-cta">
                                Start free trial
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
