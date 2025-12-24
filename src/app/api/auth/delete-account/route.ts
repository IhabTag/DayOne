import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, destroyCurrentSession } from '@/lib/auth';
import { createAuditLog, AuditActions, handleApiError, AuthenticationError } from '@/lib/observability';

export async function DELETE() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new AuthenticationError();
        }

        // Create audit log before deletion (so we have record of who requested it)
        await createAuditLog({
            userId: user.id,
            action: AuditActions.USER_DELETED,
            metadata: { reason: 'User requested account deletion' }
        });

        // Delete the user
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Destroy session
        await destroyCurrentSession();

        return NextResponse.json(
            { message: 'Account deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
