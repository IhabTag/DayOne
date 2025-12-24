'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Cookie consent preferences
export interface ConsentPreferences {
    necessary: boolean; // Always true - required for site to function
    analytics: boolean; // PostHog, etc.
    marketing: boolean; // Future: ads, remarketing
}

// Consent state
interface ConsentState {
    hasConsented: boolean;
    preferences: ConsentPreferences;
    showBanner: boolean;
    showCustomize: boolean;
}

// Context value
interface CookieConsentContextValue extends ConsentState {
    acceptAll: () => void;
    rejectAll: () => void;
    updatePreferences: (preferences: Partial<ConsentPreferences>) => void;
    showCustomizeView: () => void;
    openSettings: () => void;
    closeBanner: () => void;
}

const STORAGE_KEY = 'cookie_consent';

const defaultPreferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ConsentState>({
        hasConsented: false,
        preferences: defaultPreferences,
        showBanner: false,
        showCustomize: false,
    });

    // Load consent from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setState({
                    hasConsented: true,
                    preferences: {
                        necessary: true, // Always true
                        analytics: Boolean(parsed.analytics),
                        marketing: Boolean(parsed.marketing),
                    },
                    showBanner: false,
                    showCustomize: false,
                });
            } else {
                // No consent stored - show banner
                setState(prev => ({ ...prev, showBanner: true }));
            }
        } catch {
            // Error reading localStorage - show banner
            setState(prev => ({ ...prev, showBanner: true }));
        }
    }, []);

    const savePreferences = useCallback((preferences: ConsentPreferences) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch {
            console.error('Failed to save cookie consent preferences');
        }
    }, []);

    const acceptAll = useCallback(() => {
        const preferences: ConsentPreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        savePreferences(preferences);
        setState({
            hasConsented: true,
            preferences,
            showBanner: false,
            showCustomize: false,
        });
    }, [savePreferences]);

    const rejectAll = useCallback(() => {
        const preferences: ConsentPreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        savePreferences(preferences);
        setState({
            hasConsented: true,
            preferences,
            showBanner: false,
            showCustomize: false,
        });
    }, [savePreferences]);

    const updatePreferences = useCallback((newPrefs: Partial<ConsentPreferences>) => {
        setState(prev => {
            const preferences: ConsentPreferences = {
                necessary: true, // Always true
                analytics: newPrefs.analytics ?? prev.preferences.analytics,
                marketing: newPrefs.marketing ?? prev.preferences.marketing,
            };
            savePreferences(preferences);
            return {
                hasConsented: true,
                preferences,
                showBanner: false,
                showCustomize: false,
            };
        });
    }, [savePreferences]);

    const openSettings = useCallback(() => {
        setState(prev => ({
            ...prev,
            showBanner: true,
            showCustomize: true,
        }));
    }, []);

    const showCustomizeView = useCallback(() => {
        setState(prev => ({
            ...prev,
            showCustomize: true,
        }));
    }, []);

    const closeBanner = useCallback(() => {
        setState(prev => ({
            ...prev,
            showBanner: false,
            showCustomize: false,
        }));
    }, []);

    return (
        <CookieConsentContext.Provider
            value={{
                ...state,
                acceptAll,
                rejectAll,
                updatePreferences,
                showCustomizeView,
                openSettings,
                closeBanner,
            }}
        >
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}
