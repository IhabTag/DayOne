/**
 * Auth Configuration API Endpoint
 * 
 * GET /api/auth/config
 * 
 * Returns public authentication configuration for frontend.
 * Does NOT expose secrets, only feature flags.
 */

import { NextResponse } from 'next/server';
import { isGoogleOAuthEnabled } from '@/lib/auth';

export async function GET() {
    return NextResponse.json({
        googleOAuthEnabled: isGoogleOAuthEnabled(),
    });
}
