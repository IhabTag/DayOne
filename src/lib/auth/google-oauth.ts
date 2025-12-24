/**
 * Google OAuth Implementation
 * 
 * Handles the complete Google OAuth 2.0 flow including:
 * - Authorization URL generation
 * - CSRF state parameter management
 * - Token exchange
 * - ID token verification
 * - User profile extraction
 * 
 * All configuration is driven via environment variables (see oauth-config.ts).
 */

import { cookies } from 'next/headers';
import { getGoogleOAuthConfig } from './oauth-config';
import { generateSessionToken } from './tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface GoogleUserProfile {
    sub: string;          // Google's unique user ID
    email: string;
    emailVerified: boolean;
    name?: string;
    picture?: string;
}

export interface GoogleTokens {
    accessToken: string;
    idToken: string;
    expiresIn: number;
    tokenType: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const OAUTH_STATE_COOKIE = 'oauth_state';
const OAUTH_STATE_EXPIRY_MINUTES = 10;

// =============================================================================
// STATE MANAGEMENT (CSRF Protection)
// =============================================================================

/**
 * Generate a cryptographically secure state parameter for CSRF protection.
 * Stores the state in an HTTP-only cookie for validation during callback.
 */
export async function generateOAuthState(): Promise<string> {
    const state = generateSessionToken(); // Reuse existing secure token generator

    const cookieStore = await cookies();
    const expiresAt = new Date(Date.now() + OAUTH_STATE_EXPIRY_MINUTES * 60 * 1000);

    cookieStore.set(OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });

    return state;
}

/**
 * Validate the state parameter from Google callback against stored cookie.
 * Clears the state cookie after validation to prevent replay attacks.
 */
export async function validateOAuthState(state: string): Promise<boolean> {
    const cookieStore = await cookies();
    const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

    // Clear the state cookie regardless of validity
    cookieStore.delete(OAUTH_STATE_COOKIE);

    if (!storedState || !state) {
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    if (storedState.length !== state.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < storedState.length; i++) {
        result |= storedState.charCodeAt(i) ^ state.charCodeAt(i);
    }

    return result === 0;
}

// =============================================================================
// AUTHORIZATION URL
// =============================================================================

/**
 * Generate the Google OAuth authorization URL.
 * User will be redirected here to consent to the OAuth flow.
 */
export function generateGoogleAuthUrl(state: string): string {
    const config = getGoogleOAuthConfig();

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        access_type: 'online',
        prompt: 'select_account', // Always show account chooser
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// =============================================================================
// TOKEN EXCHANGE
// =============================================================================

/**
 * Exchange authorization code for access and ID tokens.
 * Called during the OAuth callback after user consents.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const config = getGoogleOAuthConfig();

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl,
            grant_type: 'authorization_code',
            code: code,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token exchange failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
    };
}

// =============================================================================
// ID TOKEN VERIFICATION
// =============================================================================

/**
 * Verify and decode a Google ID token.
 * Validates the token's signature, issuer, audience, and expiry.
 * 
 * Note: For production, consider using Google's tokeninfo endpoint or
 * a JWT library with Google's public keys. This implementation uses
 * the userinfo endpoint which is simpler but requires an extra request.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserProfile> {
    const config = getGoogleOAuthConfig();

    // Use Google's tokeninfo endpoint to verify the ID token
    const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!response.ok) {
        throw new Error('Invalid ID token');
    }

    const data = await response.json();

    // Validate audience matches our client ID
    if (data.aud !== config.clientId) {
        throw new Error('ID token audience mismatch');
    }

    // Validate issuer
    if (data.iss !== 'https://accounts.google.com' && data.iss !== 'accounts.google.com') {
        throw new Error('ID token issuer invalid');
    }

    // Validate expiry
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && parseInt(data.exp, 10) < now) {
        throw new Error('ID token expired');
    }

    return {
        sub: data.sub,
        email: data.email,
        emailVerified: data.email_verified === 'true' || data.email_verified === true,
        name: data.name,
        picture: data.picture,
    };
}

// =============================================================================
// USER PROFILE (Alternative method)
// =============================================================================

/**
 * Fetch user profile from Google's userinfo endpoint.
 * This is an alternative to decoding the ID token.
 */
export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Google user profile');
    }

    const data = await response.json();

    return {
        sub: data.sub,
        email: data.email,
        emailVerified: data.email_verified === true,
        name: data.name,
        picture: data.picture,
    };
}
