import { nanoid } from 'nanoid';

/**
 * Generate a secure random token for sessions
 */
export function generateSessionToken(): string {
    return nanoid(64);
}

/**
 * Generate a secure token for email verification
 */
export function generateVerificationToken(): string {
    return nanoid(32);
}

/**
 * Generate a secure token for password reset
 */
export function generatePasswordResetToken(): string {
    return nanoid(32);
}

/**
 * Generate a secure token for email change
 */
export function generateEmailChangeToken(): string {
    return nanoid(32);
}

/**
 * Calculate token expiry date
 */
export function getTokenExpiry(hours: number): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}
