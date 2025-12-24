/**
 * OAuth Configuration Module
 * 
 * Centralizes all OAuth-related environment variable access.
 * All Google OAuth configuration is driven by environment variables.
 */

export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
}

/**
 * Check if Google OAuth is enabled via environment variable.
 * When disabled, all Google auth UI and endpoints should be hidden/return 404.
 */
export function isGoogleOAuthEnabled(): boolean {
    return process.env.GOOGLE_OAUTH_ENABLED === 'true';
}

/**
 * Get Google OAuth configuration from environment variables.
 * Throws if called when Google OAuth is disabled or misconfigured.
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig {
    if (!isGoogleOAuthEnabled()) {
        throw new Error('Google OAuth is not enabled');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_OAUTH_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw new Error(
            'Google OAuth is enabled but missing required configuration. ' +
            'Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_OAUTH_CALLBACK_URL are set.'
        );
    }

    return { clientId, clientSecret, callbackUrl };
}

/**
 * Check if new user signups via Google OAuth are allowed.
 * When false, only existing users can log in via Google.
 */
export function isGoogleSignupAllowed(): boolean {
    return process.env.GOOGLE_OAUTH_ALLOW_SIGNUP !== 'false';
}

/**
 * Check if emails from Google should be auto-verified.
 * Google guarantees email ownership, so this is typically safe to enable.
 */
export function shouldAutoVerifyGoogleEmail(): boolean {
    return process.env.GOOGLE_OAUTH_AUTO_VERIFY_EMAIL !== 'false';
}
