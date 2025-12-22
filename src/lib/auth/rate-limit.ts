import prisma from '@/lib/db';

interface RateLimitConfig {
    maxAttempts: number;
    windowMinutes: number;
}

// Default rate limit configurations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
    login: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
        windowMinutes: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MINUTES || '15', 10),
    },
    signup: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_SIGNUP_MAX || '3', 10),
        windowMinutes: parseInt(process.env.RATE_LIMIT_SIGNUP_WINDOW_MINUTES || '60', 10),
    },
    password_reset: {
        maxAttempts: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || '3', 10),
        windowMinutes: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MINUTES || '60', 10),
    },
    email_verification: {
        maxAttempts: 5,
        windowMinutes: 60,
    },
};

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Check if an action is rate limited
 */
export async function checkRateLimit(
    identifier: string,
    action: string
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[action];
    if (!config) {
        // If no config for this action, allow by default
        return { allowed: true, remaining: Infinity, resetAt: new Date() };
    }

    const now = new Date();

    // Find existing rate limit entry
    const entry = await prisma.rateLimitEntry.findUnique({
        where: {
            identifier_action: { identifier, action },
        },
    });

    // If no entry or expired, action is allowed
    if (!entry || entry.expiresAt < now) {
        const expiresAt = new Date(now.getTime() + config.windowMinutes * 60 * 1000);
        return {
            allowed: true,
            remaining: config.maxAttempts - 1,
            resetAt: expiresAt,
        };
    }

    // Entry exists and is valid
    const remaining = config.maxAttempts - entry.count;
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining - 1),
        resetAt: entry.expiresAt,
    };
}

/**
 * Increment the rate limit counter for an action
 */
export async function incrementRateLimit(
    identifier: string,
    action: string
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[action];
    if (!config) {
        return { allowed: true, remaining: Infinity, resetAt: new Date() };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.windowMinutes * 60 * 1000);

    // Upsert the rate limit entry
    const entry = await prisma.rateLimitEntry.upsert({
        where: {
            identifier_action: { identifier, action },
        },
        update: {
            count: {
                increment: 1,
            },
            // If expired, reset the window
            windowStart: now,
            expiresAt: expiresAt,
        },
        create: {
            identifier,
            action,
            count: 1,
            windowStart: now,
            expiresAt,
        },
    });

    // Check if the entry was expired and needs reset
    // We handle this by checking if we need to reset
    const actualEntry = await prisma.rateLimitEntry.findUnique({
        where: {
            identifier_action: { identifier, action },
        },
    });

    if (actualEntry && actualEntry.expiresAt < now) {
        // Entry is expired, reset it
        const resetEntry = await prisma.rateLimitEntry.update({
            where: {
                identifier_action: { identifier, action },
            },
            data: {
                count: 1,
                windowStart: now,
                expiresAt,
            },
        });
        return {
            allowed: true,
            remaining: config.maxAttempts - 1,
            resetAt: resetEntry.expiresAt,
        };
    }

    const remaining = config.maxAttempts - entry.count;
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        resetAt: entry.expiresAt,
    };
}

/**
 * Reset rate limit for an identifier/action pair
 */
export async function resetRateLimit(identifier: string, action: string): Promise<void> {
    try {
        await prisma.rateLimitEntry.delete({
            where: {
                identifier_action: { identifier, action },
            },
        });
    } catch {
        // Entry may not exist
    }
}

/**
 * Clean up expired rate limit entries
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
    const result = await prisma.rateLimitEntry.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });

    return result.count;
}

/**
 * Get rate limit headers for API responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
    };
}
