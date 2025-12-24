import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, AuthorizationError, ValidationError, NotFoundError } from '@/lib/observability';

// Validation schema for updating a referral link
const updateReferralLinkSchema = z.object({
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be 100 characters or less')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Slug must only contain letters, numbers, underscores, and hyphens')
        .optional(),
    displayName: z.string().max(200).nullable().optional(),
    trialDays: z
        .number()
        .int('Trial days must be a whole number')
        .min(1, 'Trial days must be at least 1')
        .max(365, 'Trial days cannot exceed 365')
        .optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const { id } = await params;

        const referralLink = await prisma.referralLink.findUnique({
            where: { id },
            include: {
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
            },
        });

        if (!referralLink) {
            throw new NotFoundError('Referral link not found');
        }

        // Get last signup date
        const lastSignup = await prisma.user.findFirst({
            where: { referrerId: id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });

        const appUrl = process.env.APP_URL || 'http://localhost:3000';

        return NextResponse.json({
            referralLink: {
                id: referralLink.id,
                slug: referralLink.slug,
                displayName: referralLink.displayName,
                trialDays: referralLink.trialDays,
                isActive: referralLink.isActive,
                createdAt: referralLink.createdAt.toISOString(),
                updatedAt: referralLink.updatedAt.toISOString(),
                createdBy: referralLink.createdByUser
                    ? {
                        id: referralLink.createdByUser.id,
                        name: referralLink.createdByUser.name,
                        email: referralLink.createdByUser.email,
                    }
                    : null,
                signupCount: referralLink._count.referredUsers,
                lastSignupAt: lastSignup?.createdAt.toISOString() || null,
                url: `${appUrl}/${referralLink.slug}`,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'SUPERADMIN') {
            throw new AuthorizationError('Admin access required');
        }

        const { id } = await params;

        // Check if referral link exists
        const existingLink = await prisma.referralLink.findUnique({
            where: { id },
        });

        if (!existingLink) {
            throw new NotFoundError('Referral link not found');
        }

        const body = await request.json();
        const result = updateReferralLinkSchema.safeParse(body);

        if (!result.success) {
            throw new ValidationError('Invalid input', {
                ...result.error.flatten().fieldErrors,
            });
        }

        const { slug, displayName, trialDays, isActive } = result.data;

        // If slug is being changed, check for uniqueness
        if (slug && slug.toLowerCase() !== existingLink.slug) {
            const slugExists = await prisma.referralLink.findUnique({
                where: { slug: slug.toLowerCase() },
            });
            if (slugExists) {
                throw new ValidationError('A referral link with this slug already exists', {
                    slug: ['This slug is already in use'],
                });
            }
        }

        // Determine which audit action to use
        let auditAction: string = AuditActions.REFERRAL_LINK_UPDATED;
        if (isActive !== undefined && isActive !== existingLink.isActive) {
            auditAction = isActive
                ? AuditActions.REFERRAL_LINK_ENABLED
                : AuditActions.REFERRAL_LINK_DISABLED;
        }

        // Update the referral link
        const updatedLink = await prisma.referralLink.update({
            where: { id },
            data: {
                ...(slug && { slug: slug.toLowerCase() }),
                ...(displayName !== undefined && { displayName }),
                ...(trialDays !== undefined && { trialDays }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        // Audit log with before/after values
        await createAuditLog({
            actorId: user.id,
            action: auditAction,
            entityType: 'referral_link',
            entityId: id,
            metadata: {
                before: {
                    slug: existingLink.slug,
                    displayName: existingLink.displayName,
                    trialDays: existingLink.trialDays,
                    isActive: existingLink.isActive,
                },
                after: {
                    slug: updatedLink.slug,
                    displayName: updatedLink.displayName,
                    trialDays: updatedLink.trialDays,
                    isActive: updatedLink.isActive,
                },
            },
        });

        const appUrl = process.env.APP_URL || 'http://localhost:3000';

        return NextResponse.json({
            message: 'Referral link updated successfully',
            referralLink: {
                id: updatedLink.id,
                slug: updatedLink.slug,
                displayName: updatedLink.displayName,
                trialDays: updatedLink.trialDays,
                isActive: updatedLink.isActive,
                createdAt: updatedLink.createdAt.toISOString(),
                updatedAt: updatedLink.updatedAt.toISOString(),
                url: `${appUrl}/${updatedLink.slug}`,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
