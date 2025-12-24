import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-brand">
                    <Link href="/" className="auth-logo">
                        <svg
                            className="auth-logo-icon"
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
                        <span className="auth-logo-text">DayOne</span>
                    </Link>
                </div>
                <div className="auth-content">{children}</div>
                <div className="auth-footer">
                    <p>
                        &copy; {new Date().getFullYear()} DayOne. All rights reserved.
                    </p>
                </div>
            </div>
            <div className="auth-hero">
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Launch your SaaS
                        <span className="gradient-text"> in 48 hours</span>
                    </h1>
                    <p className="auth-hero-description">
                        Production-ready starter kit with AI-assisted coding. Build faster, launch sooner.
                    </p>
                    <div className="auth-hero-features">
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Authentication & RBAC</span>
                        </div>
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Subscription management</span>
                        </div>
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Admin dashboard</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
