import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { generateSessionToken, getTokenExpiry, isTokenExpired } from './tokens';
import type { User, Session } from '@/generated/prisma';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24', 10);

export interface SessionUser {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    timezone: string;
    role: 'USER' | 'SUPERADMIN';
    status: 'ACTIVE' | 'DEACTIVATED';
    emailVerified: Date | null;
    plan: 'BASIC' | 'PRO';
    trialEndDate: Date;
    planOverride: boolean;
    createdAt: Date;
}

/**
 * Create a new session for a user
 */
export async function createSession(
    userId: string,
    metadata: { ipAddress?: string | null; userAgent?: string | null } = {}
): Promise<Session> {
    const token = generateSessionToken();
    const expiresAt = getTokenExpiry(SESSION_EXPIRY_HOURS);

    const session = await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt,
            ipAddress: metadata.ipAddress || null,
            userAgent: metadata.userAgent || null,
        },
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });

    return session;
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<(Session & { user: User }) | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!session) {
        return null;
    }

    // Check if session is expired
    if (isTokenExpired(session.expiresAt)) {
        await destroySession(token);
        return null;
    }

    // Check if user is deactivated
    if (session.user.status === 'DEACTIVATED') {
        await destroySession(token);
        return null;
    }

    return session;
}

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const { user } = session;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        timezone: user.timezone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        plan: user.plan,
        trialEndDate: user.trialEndDate,
        planOverride: user.planOverride,
        createdAt: user.createdAt,
    };
}

/**
 * Destroy a session by token
 */
export async function destroySession(token: string): Promise<void> {
    try {
        await prisma.session.delete({
            where: { token },
        });
    } catch {
        // Session may already be deleted
    }

    // Clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Destroy the current session
 */
export async function destroyCurrentSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        await destroySession(token);
    }
}

/**
 * Destroy all sessions for a user
 */
export async function destroyAllUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
        where: { userId },
    });
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
        where: {
            userId,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Extend session expiry (optional - for "remember me" functionality)
 */
export async function extendSession(token: string): Promise<void> {
    const newExpiry = getTokenExpiry(SESSION_EXPIRY_HOURS);

    await prisma.session.update({
        where: { token },
        data: { expiresAt: newExpiry },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: newExpiry,
        path: '/',
    });
}

/**
 * Clean up expired sessions (can be called by a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });

    return result.count;
}
