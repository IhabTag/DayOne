'use client';

import Link from 'next/link';
import { useCookieConsent } from './providers/CookieConsentContext';

export default function Footer() {
    const { openSettings } = useCookieConsent();

    return (
        <footer className="landing-footer">
            <div className="landing-footer-content">
                <p>&copy; {new Date().getFullYear()} DayOne. All rights reserved.</p>
                <nav className="footer-links" aria-label="Footer navigation">
                    <Link href="/privacy" className="footer-link">
                        Privacy Policy
                    </Link>
                    <span className="footer-separator" aria-hidden="true">•</span>
                    <Link href="/terms" className="footer-link">
                        Terms & Conditions
                    </Link>
                    <span className="footer-separator" aria-hidden="true">•</span>
                    <button
                        onClick={openSettings}
                        className="footer-link footer-link-button"
                        type="button"
                    >
                        Cookie Settings
                    </button>
                </nav>
            </div>
        </footer>
    );
}
