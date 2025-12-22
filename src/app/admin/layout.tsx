'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'SUPERADMIN';
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
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

                // Check if user is superadmin
                if (data.user?.role !== 'SUPERADMIN') {
                    router.push('/dashboard');
                    return;
                }

                setUser(data.user);
            } catch {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const navItems = [
        {
            name: 'Overview',
            href: '/admin',
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
            name: 'Users',
            href: '/admin/users',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            name: 'Audit Logs',
            href: '/admin/audit-logs',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            ),
        },
        {
            name: 'System Health',
            href: '/admin/health',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Loading admin panel...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="admin-layout">
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
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <Link href="/admin" className="admin-logo">
                        <div className="admin-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div className="admin-logo-text">
                            <span>Admin Panel</span>
                            <span className="admin-logo-badge">Superadmin</span>
                        </div>
                    </Link>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div className="admin-nav-divider" />

                    <Link
                        href="/dashboard"
                        className="admin-nav-item"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="admin-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </span>
                        <span>Back to Dashboard</span>
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user">
                        <div className="admin-user-avatar">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className="admin-user-info">
                            <div className="admin-user-name">{user.name || 'Admin'}</div>
                            <div className="admin-user-role">Superadmin</div>
                        </div>
                    </div>
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
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
