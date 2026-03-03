// ════════════════════════════════════════════════════════════
// Next.js Middleware – Role-Based Route Protection
// ════════════════════════════════════════════════════════════
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/auth/callback'];

// Role-based route access mapping
const ROLE_ROUTES: Record<string, string[]> = {
    admin: ['/admin'],
    murabbi: ['/murabbi'],
    salik: ['/salik'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        const { supabaseResponse } = await updateSession(request);
        return supabaseResponse;
    }

    // Allow static assets and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get user session
    const { user, supabase, supabaseResponse } = await updateSession(request);

    // Redirect unauthenticated users to login
    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Get user role from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role;

    // If on root, redirect to role-specific dashboard
    if (pathname === '/') {
        if (role) {
            return NextResponse.redirect(new URL(`/${role}`, request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    if (role) {
        const allowedRoutes = ROLE_ROUTES[role] || [];
        const isAllowed = allowedRoutes.some((route) =>
            pathname.startsWith(route)
        );

        if (!isAllowed) {
            // Redirect to their own dashboard
            return NextResponse.redirect(new URL(`/${role}`, request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
