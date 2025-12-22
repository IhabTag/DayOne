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
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 12L12 17L22 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="auth-logo-text">SaaS Kit</span>
                    </Link>
                </div>
                <div className="auth-content">{children}</div>
                <div className="auth-footer">
                    <p>
                        &copy; {new Date().getFullYear()} SaaS Kit. All rights reserved.
                    </p>
                </div>
            </div>
            <div className="auth-hero">
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Build amazing products
                        <span className="gradient-text"> faster</span>
                    </h1>
                    <p className="auth-hero-description">
                        Start your 14-day Pro trial today. No credit card required.
                    </p>
                    <div className="auth-hero-features">
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Unlimited projects</span>
                        </div>
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Advanced analytics</span>
                        </div>
                        <div className="auth-hero-feature">
                            <svg className="auth-hero-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Priority support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
