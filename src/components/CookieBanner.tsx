'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCookieConsent, ConsentPreferences } from './providers/CookieConsentContext';

export default function CookieBanner() {
    const {
        showBanner,
        showCustomize,
        preferences,
        acceptAll,
        rejectAll,
        updatePreferences,
        showCustomizeView,
        closeBanner,
    } = useCookieConsent();

    const [localPrefs, setLocalPrefs] = useState<ConsentPreferences>(preferences);
    const [isVisible, setIsVisible] = useState(false);

    // Sync local preferences when context preferences change
    useEffect(() => {
        setLocalPrefs(preferences);
    }, [preferences]);

    // Handle animation
    useEffect(() => {
        if (showBanner) {
            // Small delay for mount animation
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [showBanner]);

    if (!showBanner) return null;

    const handleSavePreferences = () => {
        updatePreferences(localPrefs);
    };

    const togglePreference = (key: keyof ConsentPreferences) => {
        if (key === 'necessary') return; // Can't toggle necessary
        setLocalPrefs(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`cookie-banner-backdrop ${isVisible ? 'visible' : ''}`}
                onClick={closeBanner}
                aria-hidden="true"
            />

            {/* Banner */}
            <div
                className={`cookie-banner ${isVisible ? 'visible' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-banner-title"
                aria-describedby="cookie-banner-description"
            >
                <div className="cookie-banner-content">
                    <div className="cookie-banner-header">
                        <div className="cookie-banner-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="8" cy="9" r="1.5" fill="currentColor" />
                                <circle cx="15" cy="8" r="1" fill="currentColor" />
                                <circle cx="10" cy="14" r="1" fill="currentColor" />
                                <circle cx="16" cy="13" r="1.5" fill="currentColor" />
                                <circle cx="13" cy="17" r="1" fill="currentColor" />
                            </svg>
                        </div>
                        <div>
                            <h2 id="cookie-banner-title" className="cookie-banner-title">
                                We value your privacy
                            </h2>
                            <p id="cookie-banner-description" className="cookie-banner-description">
                                We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
                                You can choose which cookies you&apos;d like to accept.{' '}
                                <Link href="/privacy" className="cookie-banner-link" onClick={closeBanner}>
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>

                    {showCustomize ? (
                        /* Customize View */
                        <div className="cookie-preferences">
                            <div className="cookie-preference-item">
                                <div className="cookie-preference-info">
                                    <span className="cookie-preference-name">Necessary</span>
                                    <span className="cookie-preference-desc">
                                        Required for the site to function. Cannot be disabled.
                                    </span>
                                </div>
                                <button
                                    className="cookie-toggle cookie-toggle-locked"
                                    disabled
                                    aria-label="Necessary cookies are always enabled"
                                >
                                    <span className="cookie-toggle-slider checked" />
                                </button>
                            </div>

                            <div className="cookie-preference-item">
                                <div className="cookie-preference-info">
                                    <span className="cookie-preference-name">Analytics</span>
                                    <span className="cookie-preference-desc">
                                        Help us understand how visitors use our site.
                                    </span>
                                </div>
                                <button
                                    className={`cookie-toggle ${localPrefs.analytics ? 'active' : ''}`}
                                    onClick={() => togglePreference('analytics')}
                                    aria-pressed={localPrefs.analytics}
                                    aria-label="Toggle analytics cookies"
                                >
                                    <span className={`cookie-toggle-slider ${localPrefs.analytics ? 'checked' : ''}`} />
                                </button>
                            </div>

                            <div className="cookie-preference-item">
                                <div className="cookie-preference-info">
                                    <span className="cookie-preference-name">Marketing</span>
                                    <span className="cookie-preference-desc">
                                        Used for personalized ads and marketing campaigns.
                                    </span>
                                </div>
                                <button
                                    className={`cookie-toggle ${localPrefs.marketing ? 'active' : ''}`}
                                    onClick={() => togglePreference('marketing')}
                                    aria-pressed={localPrefs.marketing}
                                    aria-label="Toggle marketing cookies"
                                >
                                    <span className={`cookie-toggle-slider ${localPrefs.marketing ? 'checked' : ''}`} />
                                </button>
                            </div>

                            <div className="cookie-banner-actions">
                                <button
                                    className="cookie-btn cookie-btn-secondary"
                                    onClick={rejectAll}
                                >
                                    Reject All
                                </button>
                                <button
                                    className="cookie-btn cookie-btn-primary"
                                    onClick={handleSavePreferences}
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Simple View */
                        <div className="cookie-banner-actions">
                            <button
                                className="cookie-btn cookie-btn-outline"
                                onClick={showCustomizeView}
                            >
                                Customize
                            </button>
                            <button
                                className="cookie-btn cookie-btn-secondary"
                                onClick={rejectAll}
                            >
                                Reject All
                            </button>
                            <button
                                className="cookie-btn cookie-btn-primary"
                                onClick={acceptAll}
                            >
                                Accept All
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
