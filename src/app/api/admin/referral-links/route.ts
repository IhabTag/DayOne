import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, AuthorizationError, ValidationError } from '@/lib/observability';

// Validation schema for creating a referral link
const createReferralLinkSchema = z.object({
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be 100 characters or less')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Slug must only contain letters, numbers, underscores, and hyphens'),
    displayName: z.string().max(200).optional(),
    trialDays: z
        .number()
        .int('Trial days must be a whole number')
        .min(1, 'Trial days must be at least 1')
        .max(365, 'Trial days cannot exceed 365'),
    isActive: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const where = {
            ...(search && {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' as const } },
                    { displayName: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
            ...(status === 'active' && { isActive: true }),
            ...(status === 'inactive' && { isActive: false }),
        };

        // Determine ordering
        type OrderByField = 'createdAt' | 'slug' | 'trialDays';
        const validSortFields: OrderByField[] = ['createdAt', 'slug', 'trialDays'];
        const orderField = validSortFields.includes(sortBy as OrderByField) ? sortBy as OrderByField : 'createdAt';
        const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

        const [referralLinks, total] = await Promise.all([
            prisma.referralLink.findMany({
                where,
                select: {
                    id: true,
                    slug: true,
                    displayName: true,
                    trialDays: true,
                    isActive: true,
                    createdAt: true,
                    createdByUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            referredUsers: true,
                        },
                    },
                    referredUsers: {
                        select: {
                            createdAt: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                    },
                },
                orderBy: { [orderField]: orderDir },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.referralLink.count({ where }),
        ]);

        return NextResponse.json({
            referralLinks: referralLinks.map((link) => ({
                id: link.id,
                slug: link.slug,
                displayName: link.displayName,
                trialDays: link.trialDays,
                isActive: link.isActive,
                createdAt: link.createdAt.toISOString(),
                createdBy: link.createdByUser
                    ? {
                        id: link.createdByUser.id,
                        name: link.createdByUser.name,
                        email: link.createdByUser.email,
                    }
                    : null,
                signupCount: link._count.referredUsers,
                lastSignupAt: link.referredUsers[0]?.createdAt.toISOString() || null,
            })),
            total,
            page,
            limit,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const body = await request.json();
        const result = createReferralLinkSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { slug, displayName, trialDays, isActive } = result.data;

        // Normalize slug to lowercase for case-insensitive uniqueness
        const normalizedSlug = slug.toLowerCase();

        // Check if slug already exists
        const existingLink = await prisma.referralLink.findUnique({
            where: { slug: normalizedSlug },
        });

        if (existingLink) {
            throw new ValidationError('A referral link with this slug already exists', {
                slug: ['This slug is already in use'],
            });
        }

        // Create the referral link
        const referralLink = await prisma.referralLink.create({
            data: {
                slug: normalizedSlug,
                displayName: displayName || null,
                trialDays,
                isActive,
                createdByUserId: user.id,
            },
        });

        // Audit log
        await createAuditLog({
            actorId: user.id,
            action: AuditActions.REFERRAL_LINK_CREATED,
            entityType: 'referral_link',
            entityId: referralLink.id,
            metadata: {
                slug: referralLink.slug,
                displayName: referralLink.displayName,
                trialDays: referralLink.trialDays,
                isActive: referralLink.isActive,
            },
        });

        // Generate the full URL
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const referralUrl = `${appUrl}/${referralLink.slug}`;

        return NextResponse.json(
            {
                message: 'Referral link created successfully',
                referralLink: {
                    id: referralLink.id,
                    slug: referralLink.slug,
                    displayName: referralLink.displayName,
                    trialDays: referralLink.trialDays,
                    isActive: referralLink.isActive,
                    createdAt: referralLink.createdAt.toISOString(),
                    url: referralUrl,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
