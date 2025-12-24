import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const plans = [
    {
        name: 'Starter',
        price: 'Free',
        description: 'Try before you buy',
        features: [
            '14-day Pro trial included',
            'Full source code access',
            'Community support',
        ],
        notIncluded: [
            'Priority support',
            'Future updates',
            'Commercial license',
        ],
        cta: 'Start free trial',
        ctaLink: '/auth/signup',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$49',
        period: 'one-time',
        description: 'Everything you need to launch',
        features: [
            'Full source code',
            'Authentication & RBAC',
            'Google OAuth integration',
            'Subscription system',
            'Advanced referral system',
            'Admin dashboard',
            'PostHog analytics',
            'Email integration',
            'Docker ready',
            'Lifetime updates',
            'Commercial license',
        ],
        notIncluded: [],
        cta: 'Get DayOne Pro',
        ctaLink: '/auth/signup',
        highlighted: true,
        badge: 'Best Value',
    },
];

export default function PricingPage() {
    return (
        <div className="pricing-page">
            {/* Navigation */}
            <PublicHeader />

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
                            to the free tier with limited features. Upgrade anytime to keep full access.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>Can I use this for commercial projects?</h3>
                        <p>
                            Yes! The Pro license includes commercial use rights. Build and sell
                            as many SaaS products as you want.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>How does AI-assisted coding work?</h3>
                        <p>
                            DayOne&apos;s clean codebase is optimized for AI coding assistants like Cursor
                            and Claude. Just describe what you want to build and let AI handle the implementation.
                        </p>
                    </div>
                    <div className="pricing-faq-item">
                        <h3>What tech stack is included?</h3>
                        <p>
                            Next.js 15, PostgreSQL with Prisma, TypeScript, and Docker.
                            Everything you need for a production SaaS.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
