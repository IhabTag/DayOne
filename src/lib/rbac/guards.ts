import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getCurrentUser, type SessionUser } from '@/lib/auth';

export type GuardResult =
    | { success: true; user: SessionUser }
    | { success: false; error: string; redirect?: string };

/**
 * Check if user is authenticated
 */
export async function requiresAuth(): Promise<GuardResult> {
    const user = await getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: 'Authentication required',
            redirect: '/auth/login',
        };
    }

    if (user.status === 'DEACTIVATED') {
        return {
            success: false,
            error: 'Account has been deactivated',
            redirect: '/auth/login',
        };
    }

    return { success: true, user };
}

/**
 * Check if user has verified their email
 */
export async function requiresVerifiedEmail(): Promise<GuardResult> {
    const authResult = await requiresAuth();

    if (!authResult.success) {
        return authResult;
    }

    if (!authResult.user.emailVerified) {
        return {
            success: false,
            error: 'Email verification required',
            redirect: '/auth/verify-email',
        };
    }

    return authResult;
}

/**
 * Check if user is a superadmin
 */
export async function requiresSuperadmin(): Promise<GuardResult> {
    const authResult = await requiresVerifiedEmail();

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user.role !== 'SUPERADMIN') {
        return {
            success: false,
            error: 'Superadmin access required',
            redirect: '/dashboard',
        };
    }

    return authResult;
}

/**
 * Guard for page components - redirects on failure
 */
export async function guardPage(
    guardFn: () => Promise<GuardResult>
): Promise<SessionUser> {
    const result = await guardFn();

    if (!result.success) {
        redirect(result.redirect || '/auth/login');
    }

    return result.user;
}

/**
 * Guard for API routes - returns error response on failure
 */
export async function guardApi(
    guardFn: () => Promise<GuardResult>
): Promise<{ user: SessionUser } | NextResponse> {
    const result = await guardFn();

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: 401 }
        );
    }

    return { user: result.user };
}

/**
 * Helper to use in API routes
 */
export function isGuardError(result: { user: SessionUser } | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}
