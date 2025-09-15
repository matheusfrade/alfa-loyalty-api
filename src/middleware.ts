import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api-docs',
]

// Admin routes that require admin privileges
const adminRoutes = [
  '/admin',
  '/api/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // Redirect to login for web pages
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = await verifyToken(token)
    
    if (!payload || typeof payload.userId !== 'string') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    
    if (isAdminRoute && !payload.isAdmin) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-admin', payload.isAdmin ? 'true' : 'false')
    
    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}