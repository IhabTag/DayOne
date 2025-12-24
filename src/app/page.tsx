import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Production-Ready Starter Kit
          </div>
          <h1 className="landing-hero-title">
            Launch your SaaS in
            <span className="gradient-text"> 48 hours</span>
          </h1>
          <p className="landing-hero-description">
            Stop building boilerplate. DayOne gives you authentication, subscriptions,
            admin dashboard, and more — ready for AI-assisted coding with Antigravity, Cursor or Claude.
          </p>
          <div className="landing-hero-actions">
            <Link href="/auth/signup" className="landing-btn-primary">
              Start building now
              <svg className="landing-btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/pricing" className="landing-btn-secondary">
              View pricing
            </Link>
          </div>
          <p className="landing-hero-note">
            14-day Pro trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-section-container">
          <h2 className="landing-section-title">Everything you need to launch</h2>
          <p className="landing-section-description">
            A complete foundation for your SaaS, optimized for AI-assisted development
          </p>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Authentication & Security</h3>
              <p>Email/password and Google OAuth login, email verification, password reset, secure sessions, and rate limiting.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Role-Based Access Control</h3>
              <p>Guest, User, and Superadmin roles with protected routes on both frontend and backend. Middleware-enforced security.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h3>Subscription Management</h3>
              <p>14-day reverse trial system, automatic downgrades, plan-based feature gating, and admin override capabilities.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Superadmin Dashboard</h3>
              <p>Full user management, audit logs, system health monitoring, and administrative controls in a polished UI.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>AI-Ready Codebase</h3>
              <p>Clean, well-documented code optimized for AI assistants like Cursor and Claude. Get features built faster.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <h3>Analytics & Observability</h3>
              <p>PostHog product analytics integration, SMTP emails with HTML templates, structured audit logging, and error handling.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Viral Referral System</h3>
              <p>Built-in referral tracking with customizable trial extensions. Superadmins can create campaigns and track conversions.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  <path d="M12 12l5-4" />
                  <path d="M12 12l5 4" />
                  <path d="M12 12L7 7" />
                </svg>
              </div>
              <h3>Google OAuth Ready</h3>
              <p>Zero-config social login integration. Pre-configured next-auth provider setup to get users onboarded in seconds.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h3>GDPR Compliant</h3>
              <p>Built-in privacy controls including data export and account deletion workflows. Log masking ensures user privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="landing-tech">
        <div className="landing-section-container">
          <h2 className="landing-section-title">Modern tech stack</h2>
          <p className="landing-section-description">
            Built with the tools you already know and love
          </p>
          <div className="landing-tech-grid">
            <div className="landing-tech-item">
              <strong>Next.js 15</strong>
              <span>App Router</span>
            </div>
            <div className="landing-tech-item">
              <strong>PostgreSQL</strong>
              <span>via Prisma ORM</span>
            </div>
            <div className="landing-tech-item">
              <strong>TypeScript</strong>
              <span>Full type safety</span>
            </div>
            <div className="landing-tech-item">
              <strong>Docker</strong>
              <span>Ready to deploy</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2>Ready to launch your SaaS idea?</h2>
          <p>Start with a production-ready foundation. Focus on what makes your product unique.</p>
          <Link href="/auth/signup" className="landing-btn-primary landing-btn-large">
            Start building today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
