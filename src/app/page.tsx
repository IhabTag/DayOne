import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
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
          <div className="landing-nav-links">
            <Link href="/pricing" className="landing-nav-link">
              Pricing
            </Link>
            <Link href="/auth/login" className="landing-nav-link">
              Log in
            </Link>
            <Link href="/auth/signup" className="landing-nav-cta">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            14-day free Pro trial
          </div>
          <h1 className="landing-hero-title">
            Build your SaaS
            <span className="gradient-text"> faster than ever</span>
          </h1>
          <p className="landing-hero-description">
            A production-ready starter kit with authentication, subscriptions,
            admin dashboard, and everything you need to launch.
          </p>
          <div className="landing-hero-actions">
            <Link href="/auth/signup" className="landing-btn-primary">
              Start free trial
              <svg className="landing-btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/pricing" className="landing-btn-secondary">
              View pricing
            </Link>
          </div>
          <p className="landing-hero-note">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-section-container">
          <h2 className="landing-section-title">Everything you need</h2>
          <p className="landing-section-description">
            A complete foundation for your next SaaS product
          </p>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Secure Authentication</h3>
              <p>Email verification, password reset, rate limiting, and brute-force protection built-in.</p>
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
              <h3>Role-Based Access</h3>
              <p>User and superadmin roles with granular permissions and route protection.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>Reverse Trial</h3>
              <p>14-day Pro trial on signup, automatic downgrade to Basic when expired.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3>Email System</h3>
              <p>SMTP-ready with beautiful HTML templates for verification and notifications.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <h3>Admin Dashboard</h3>
              <p>Complete superadmin panel with user management, audit logs, and system health.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Observability</h3>
              <p>Structured logging, audit trails, and error handling ready for production.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2>Ready to get started?</h2>
          <p>Start your 14-day free trial today. No credit card required.</p>
          <Link href="/auth/signup" className="landing-btn-primary landing-btn-large">
            Start building now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <p>&copy; {new Date().getFullYear()} SaaS Kit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
