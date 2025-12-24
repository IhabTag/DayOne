import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError, AuthenticationError } from '@/lib/observability';

const METABASE_SITE_URL = process.env.METABASE_SITE_URL || 'https://metabase.ihabtag.com';
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY || '';

// Dashboard IDs for different subscription plans
const METABASE_PRO_DASHBOARD_ID = parseInt(process.env.METABASE_PRO_DASHBOARD_ID || '2', 10);
const METABASE_BASIC_DASHBOARD_ID = parseInt(process.env.METABASE_BASIC_DASHBOARD_ID || '3', 10);

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new AuthenticationError();
        }

        if (!METABASE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Metabase secret key not configured' },
                { status: 500 }
            );
        }

        // Determine the dashboard ID based on the user's plan
        const dashboardId = user.plan === 'PRO' ? METABASE_PRO_DASHBOARD_ID : METABASE_BASIC_DASHBOARD_ID;

        const payload = {
            resource: { dashboard: dashboardId },
            params: {},
            exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
        };

        const token = jwt.sign(payload, METABASE_SECRET_KEY);

        const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token +
            "#background=false&bordered=false&titled=false";

        return NextResponse.json(
            { iframeUrl, plan: user.plan },
            { status: 200 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
