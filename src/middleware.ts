import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
    '/',
    '/pricing',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
];

// Routes that require authentication
const protectedRoutePatterns = [
    '/dashboard',
    '/api/auth/change-password',
    '/api/auth/change-email',
    '/api/auth/resend-verification',
    '/api/auth/logout',
];

// Routes that require superadmin role
const adminRoutePatterns = [
    '/admin',
    '/api/admin',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;

    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(route);
    });

    // Check if this is a protected route
    const isProtectedRoute = protectedRoutePatterns.some(pattern =>
        pathname.startsWith(pattern)
    );

    // Check if this is an admin route
    const isAdminRoute = adminRoutePatterns.some(pattern =>
        pathname.startsWith(pattern)
    );

    // If no session and trying to access protected/admin route
    if (!sessionToken && (isProtectedRoute || isAdminRoute)) {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // For pages, redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated and trying to access auth pages (except logout)
    if (sessionToken && pathname.startsWith('/auth/') && pathname !== '/auth/verify-email') {
        // Allow access to verification token pages
        if (pathname.match(/^\/auth\/(verify-email|reset-password|confirm-email-change)\/[^/]+$/)) {
            return NextResponse.next();
        }

        // Redirect authenticated users away from login/signup
        if (pathname === '/auth/login' || pathname === '/auth/signup') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Note: Role-based checks (superadmin) are handled in the API routes
    // and page components since we can't easily decode the session in middleware
    // without making database calls

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
