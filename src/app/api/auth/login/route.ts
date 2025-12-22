import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
    verifyPassword,
    createSession,
    incrementRateLimit,
    checkRateLimit,
    getRateLimitHeaders,
} from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, RateLimitError, ValidationError } from '@/lib/observability';
import { getRequestMetadata } from '@/lib/utils';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        const { ipAddress, userAgent } = getRequestMetadata(request);
        const identifier = ipAddress || 'unknown';

        // Check rate limit
        const rateLimitResult = await checkRateLimit(identifier, 'login');
        if (!rateLimitResult.allowed) {
            throw new RateLimitError('Too many login attempts. Please try again later.', rateLimitResult.resetAt);
        }

        // Parse and validate request body
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { email, password } = result.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Use constant-time comparison to prevent timing attacks
        // Even if user doesn't exist, we still verify against a dummy hash
        const dummyHash = '$2a$12$dummy.hash.for.timing.attack.prevention123';
        const passwordHash = user?.passwordHash || dummyHash;
        const isValidPassword = await verifyPassword(password, passwordHash);

        if (!user || !isValidPassword) {
            // Increment rate limit for failed attempts
            await incrementRateLimit(identifier, 'login');

            // Log failed attempt if user exists
            if (user) {
                await createAuditLog({
                    userId: user.id,
                    action: AuditActions.USER_LOGIN_FAILURE,
                    ipAddress: ipAddress || undefined,
                    userAgent: userAgent || undefined,
                });
            }

            // Generic error to prevent enumeration
            return NextResponse.json(
                { error: 'Invalid email or password' },
                {
                    status: 401,
                    headers: getRateLimitHeaders(await checkRateLimit(identifier, 'login')),
                }
            );
        }

        // Check if user is deactivated
        if (user.status === 'DEACTIVATED') {
            return NextResponse.json(
                { error: 'This account has been deactivated. Please contact support.' },
                { status: 403 }
            );
        }

        // Create session
        await createSession(user.id, { ipAddress, userAgent });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_LOGIN_SUCCESS,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
        });

        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: !!user.emailVerified,
                    plan: user.plan,
                },
            },
            {
                status: 200,
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
