'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { useCookieConsent } from './CookieConsentContext';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const { hasConsented, preferences } = useCookieConsent();
    const isInitialized = useRef(false);

    useEffect(() => {
        const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

        if (!posthogKey) {
            console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set - PostHog is disabled');
            return;
        }

        // Only initialize PostHog if user has consented to analytics
        // This ensures NO network requests are made without consent
        if (hasConsented && preferences.analytics) {
            if (!isInitialized.current) {
                console.log('[PostHog] Analytics consent granted - initializing');
                posthog.init(posthogKey, {
                    api_host: posthogHost,
                    person_profiles: 'identified_only',
                    capture_pageview: true,
                    capture_pageleave: true,
                    loaded: () => {
                        console.log('[PostHog] Successfully initialized with consent!');
                    }
                });
                isInitialized.current = true;
            }
        } else if (hasConsented && !preferences.analytics && isInitialized.current) {
            // User revoked consent after it was given
            console.log('[PostHog] Analytics consent revoked - opting out');
            posthog.opt_out_capturing();
            // Clear any stored data
            posthog.reset();
        }
    }, [hasConsented, preferences.analytics]);

    // Only wrap with PHProvider if PostHog has been initialized
    if (isInitialized.current) {
        return <PHProvider client={posthog}>{children}</PHProvider>;
    }

    // Return children without PostHog context if not initialized
    return <>{children}</>;
}
