import { NextResponse } from 'next/server';
import { destroyCurrentSession, getCurrentUser } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError } from '@/lib/observability';

export async function POST() {
    try {
        const user = await getCurrentUser();

        if (user) {
            await createAuditLog({
                userId: user.id,
                action: AuditActions.USER_LOGOUT,
            });
        }

        await destroyCurrentSession();

        return NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
