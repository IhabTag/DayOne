import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names, filtering out falsy values
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}

/**
 * Safely parses JSON, returning null on failure
 */
export function safeJsonParse<T>(json: string): T | null {
    try {
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, locale = 'en-US'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Formats a date with time
 */
export function formatDateTime(date: Date | string, locale = 'en-US'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Calculates days remaining from now until a target date
 */
export function daysUntil(targetDate: Date): number {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
    return date.getTime() < Date.now();
}

/**
 * Masks an email address for privacy
 * e.g., "john.doe@example.com" -> "j***e@example.com"
 */
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain || localPart.length <= 2) {
        return `***@${domain || '***'}`;
    }
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Extracts request metadata (IP, user agent)
 */
export function getRequestMetadata(request: Request): {
    ipAddress: string | null;
    userAgent: string | null;
} {
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        null;
    const userAgent = request.headers.get('user-agent');
    return { ipAddress, userAgent };
}
