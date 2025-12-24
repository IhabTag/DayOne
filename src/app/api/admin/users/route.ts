import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthorizationError } from '@/lib/observability';
import { Prisma } from '@/generated/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const status = searchParams.get('status') || '';
        const plan = searchParams.get('plan') || '';
        const provider = searchParams.get('provider') || '';

        // Build where clause with provider filter
        const where: Prisma.UserWhereInput = {
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { name: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(role && { role: role as 'USER' | 'SUPERADMIN' }),
            ...(status && { status: status as 'ACTIVE' | 'DEACTIVATED' }),
            ...(plan && { plan: plan as 'BASIC' | 'PRO' }),
            // Provider filter: users with specific provider or password-only users
            ...(provider === 'GOOGLE' && {
                authProviders: { some: { provider: 'GOOGLE' } },
            }),
            ...(provider === 'PASSWORD_ONLY' && {
                AND: [
                    { passwordHash: { not: null } },
                    { authProviders: { none: {} } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    plan: true,
                    emailVerified: true,
                    passwordHash: true, // Just to check if exists
                    createdAt: true,
                    authProviders: {
                        select: { provider: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                status: u.status,
                plan: u.plan,
                emailVerified: u.emailVerified?.toISOString() || null,
                createdAt: u.createdAt.toISOString(),
                // Auth providers: include 'password' if passwordHash exists
                authProviders: [
                    ...(u.passwordHash ? ['password'] : []),
                    ...u.authProviders.map(p => p.provider.toLowerCase()),
                ],
            })),
            total,
            page,
            limit,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
