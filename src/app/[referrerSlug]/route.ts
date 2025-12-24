import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ referrerSlug: string }> }
) {
    const { referrerSlug } = await params;
    const homeUrl = new URL('/', request.url);

    // Normalize slug to lowercase for case-insensitive lookup
    const normalizedSlug = referrerSlug.toLowerCase();

    try {
        // Look up the referral link
        const referralLink = await prisma.referralLink.findUnique({
            where: { slug: normalizedSlug },
            select: {
                id: true,
                isActive: true,
                displayName: true,
            },
        });

        // If valid and active, set cookie and redirect
        if (referralLink && referralLink.isActive) {
            const response = NextResponse.redirect(homeUrl, { status: 302 });

            // Set the referral cookie
            // Using referral link ID for more stable tracking
            const isProduction = process.env.NODE_ENV === 'production';
            const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

            response.cookies.set('ap_ref', referralLink.id, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                path: '/',
                maxAge: thirtyDaysInSeconds,
            });

            return response;
        }
    } catch (error) {
        console.error('Error looking up referral link:', error);
    }

    // Invalid or inactive slug - just redirect without setting cookie
    return NextResponse.redirect(homeUrl, { status: 302 });
}
