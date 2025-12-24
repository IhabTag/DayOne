import prisma from '@/lib/db';
import { Prisma } from '@/generated/prisma';

export interface AuditLogParams {
    userId?: string;
    actorId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                actorId: params.actorId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            },
        });
    } catch (error) {
        // Log but don't throw - audit logging should not break the main flow
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
    userId: string,
    options: { limit?: number; offset?: number } = {}
) {
    const { limit = 50, offset = 0 } = options;

    return prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
}

/**
 * Get audit logs for admin view
 */
export async function getAuditLogs(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
} = {}) {
    const { limit = 50, offset = 0, userId, action, startDate, endDate } = options;

    return prisma.auditLog.findMany({
        where: {
            ...(userId && { userId }),
            ...(action && { action: { contains: action } }),
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
}

/**
 * Count audit logs
 */
export async function countAuditLogs(options: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
} = {}) {
    const { userId, action, startDate, endDate } = options;

    return prisma.auditLog.count({
        where: {
            ...(userId && { userId }),
            ...(action && { action: { contains: action } }),
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
        },
    });
}

// Common audit actions
export const AuditActions = {
    // Auth
    USER_SIGNUP: 'user.signup',
    USER_LOGIN_SUCCESS: 'user.login.success',
    USER_LOGIN_FAILURE: 'user.login.failure',
    USER_LOGOUT: 'user.logout',

    // Email verification
    USER_EMAIL_VERIFIED: 'user.email.verified',
    USER_EMAIL_VERIFICATION_SENT: 'user.email.verification_sent',

    // Password
    USER_PASSWORD_RESET_REQUESTED: 'user.password.reset_requested',
    USER_PASSWORD_RESET_COMPLETED: 'user.password.reset_completed',
    USER_PASSWORD_CHANGED: 'user.password.changed',

    // Email change
    USER_EMAIL_CHANGE_REQUESTED: 'user.email.change_requested',
    USER_EMAIL_CHANGED: 'user.email.changed',

    // Profile
    USER_PROFILE_UPDATED: 'user.profile.updated',

    // Admin actions
    USER_ROLE_CHANGED: 'user.role.changed',
    USER_STATUS_CHANGED: 'user.status.changed',
    USER_PLAN_CHANGED: 'user.plan.changed',
    USER_TRIAL_EXTENDED: 'user.trial.extended',
    USER_DELETED: 'user.deleted',

    // Auto actions
    USER_PLAN_AUTO_DOWNGRADED: 'user.plan.auto_downgraded',

    // Referral Links
    REFERRAL_LINK_CREATED: 'referral_link.created',
    REFERRAL_LINK_UPDATED: 'referral_link.updated',
    REFERRAL_LINK_ENABLED: 'referral_link.enabled',
    REFERRAL_LINK_DISABLED: 'referral_link.disabled',

    // OAuth
    USER_OAUTH_LOGIN: 'user.oauth.login',
    USER_OAUTH_SIGNUP: 'user.oauth.signup',
    USER_OAUTH_LINKED: 'user.oauth.linked',
    USER_OAUTH_LOGIN_BLOCKED: 'user.oauth.login_blocked',
} as const;

