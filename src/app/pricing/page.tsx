import Link from 'next/link';

const plans = [
    {
        name: 'Basic',
        price: 'Free',
        description: 'Perfect for getting started',
        features: [
            '3 Projects',
            '1 Team member',
            '1 GB Storage',
            'Community support',
        ],
        notIncluded: [
            'Advanced Analytics',
            'Priority Support',
            'Data Export',
            'API Access',
            'Custom Branding',
        ],
        cta: 'Get started',
        ctaLink: '/auth/signup',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For growing teams and businesses',
        features: [
            'Unlimited Projects',
            'Up to 10 Team members',
            '100 GB Storage',
            'Advanced Analytics',
            'Priority Support',
            'Data Export',
            'API Access',
            'Custom Branding',
        ],
        notIncluded: [],
        cta: 'Start 14-day trial',
        ctaLink: '/auth/signup',
        highlighted: true,
        badge: 'Most Popular',
    },
];

export default function PricingPage() {
    return (
        <div className="pricing-page">
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
                        <Link href="/pricing" className="landing-nav-link active">
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

            {/* Pricing Header */}
            <section className="pricing-header">
                <h1 className="pricing-title">
                    Simple, transparent pricing
                </h1>
                <p className="pricing-description">
                    Start with a 14-day Pro trial. No credit card required.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="pricing-cards">
                <div className="pricing-cards-container">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}
                        >
                            {plan.badge && (
                                <div className="pricing-badge">{plan.badge}</div>
                            )}
                            <div className="pricing-card-header">
                                <h2 className="pricing-plan-name">{plan.name}</h2>
                                <div className="pricing-price">
                                    <span className="pricing-amount">{plan.price}</span>
                                    {plan.period && (
                                        <span className="pricing-period">{plan.period}</span>
                                    )}
                                </div>
                                <p className="pricing-plan-description">{plan.description}</p>
                            </div>
                            <ul className="pricing-features">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="pricing-feature">
                                        <svg className="pricing-feature-icon included" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                                {plan.notIncluded.map((feature) => (
                                    <li key={feature} className="pricing-feature not-included">
                                        <svg className="pricing-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.ctaLink}
                                className={`pricing-cta ${plan.highlighted ? 'pricing-cta-primary' : 'pricing-cta-secondary'}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pricing-faq">
                <h2 className="pricing-faq-title">Frequently asked questions</h2>
                <div className="pricing-faq-grid">
                    <div className="pricing-faq-item">
                        <h3>What happens after the trial?</h3>
                        <p>
                            After your 14-day Pro trial ends, you&apos;ll be automatically downgraded
                            to the Basic plan. No charges, no surprises.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>Can I upgrade or downgrade anytime?</h3>
                        <p>
                            Yes! You can upgrade to Pro or downgrade to Basic at any time from
                            your account settings.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>Is there a refund policy?</h3>
                        <p>
                            We offer a 30-day money-back guarantee. If you&apos;re not satisfied,
                            contact us for a full refund.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>Do you offer team or enterprise plans?</h3>
                        <p>
                            Yes! Contact us for custom enterprise pricing with additional features
                            and support.
                        </p>
                    </div>
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
