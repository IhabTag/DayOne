'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TrialStatusBanner } from '@/components/ui';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'SUPERADMIN';
    plan: 'BASIC' | 'PRO';
    planOverride: boolean;
    trialEndDate: string;
    emailVerified: string | null;
}

interface TrialInfo {
    isOnTrial: boolean;
    isExpired: boolean;
    daysRemaining: number;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (!response.ok) {
                    router.push('/auth/login');
                    return;
                }
                const data = await response.json();
                setUser(data.user);
                setTrialInfo(data.trial);
            } catch {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
            router.refresh();
        } catch {
            // Ignore errors
        }
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            ),
        },
        {
            name: 'Profile',
            href: '/dashboard/profile',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-layout">
            {/* Mobile sidebar toggle */}
            <button
                className="dashboard-mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dashboard-sidebar-header">
                    <Link href="/" className="dashboard-logo">
                        <svg
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
                        <span>SaaS Kit</span>
                    </Link>
                </div>

                <nav className="dashboard-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`dashboard-nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="dashboard-nav-icon">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    {user.role === 'SUPERADMIN' && (
                        <>
                            <div className="dashboard-nav-divider" />
                            <Link
                                href="/admin"
                                className={`dashboard-nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="dashboard-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </span>
                                <span>Admin Panel</span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="dashboard-sidebar-footer">
                    <div className="dashboard-user">
                        <div className="dashboard-user-avatar">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className="dashboard-user-info">
                            <div className="dashboard-user-name">{user.name || 'User'}</div>
                            <div className="dashboard-user-email">{user.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="dashboard-logout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="dashboard-main">
                {trialInfo && (
                    <TrialStatusBanner
                        isOnTrial={trialInfo.isOnTrial}
                        isExpired={trialInfo.isExpired}
                        daysRemaining={trialInfo.daysRemaining}
                        plan={user.plan}
                        planOverride={user.planOverride}
                    />
                )}
                {children}
            </main>
        </div>
    );
}
