import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Privacy Policy | DayOne',
    description: 'Learn about how DayOne collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <PublicHeader />

            <main className="legal-content">
                <div className="legal-container">
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-last-updated">Last updated: December 24, 2025</p>

                    <section className="legal-section">
                        <h2>Section Title</h2>
                        <p>
                            Start writing something cool!
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
