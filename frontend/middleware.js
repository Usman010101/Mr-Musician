import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/signup', '/'];
  
  // Paths that are accessible to authenticated users regardless of role
  const unrestrictedAuthenticatedPaths = [
    '/sample-audio.mp3',
    '/_next/static',
    '/_next/image',
    '/favicon.ico'
  ];

  // Role-specific protected paths
  const roleProtectedPaths = {
    artist: ['/artist-dashboard', '/artistSettings', '/profile', '/uploadSongs'],
    listener: ['/albums', '/detectsong', '/home','/album','/texttospeech','/artist','/albums','/artists'],
    admin: ['/admin', '/admin/dashboard'],
  };

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if path is unrestricted for authenticated users
  const isUnrestrictedAuthPath = unrestrictedAuthenticatedPaths.some(path => 
    pathname.startsWith(path)
  );

  // Handle unauthenticated users
  if (!isPublicPath && !isUnrestrictedAuthPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle authenticated users
  if (token) {
    try {
      const decoded = jwt.decode(token);
      const userType = decoded?.userType;

      // Redirect authenticated users from auth pages
      if (isPublicPath) {
        const redirectPath = roleProtectedPaths[userType]?.[0] || '/login';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      // Allow unrestricted authenticated paths
      if (isUnrestrictedAuthPath) {
        return NextResponse.next();
      }

      // Validate role access
      const allowedPaths = roleProtectedPaths[userType] || [];
      const hasValidAccess = allowedPaths.some(path => 
        pathname === path || pathname.startsWith(`${path}/`)
      );

      // Redirect if no valid access
      if (!hasValidAccess) {
        const defaultPath = roleProtectedPaths[userType]?.[0] || '/login';
        return NextResponse.redirect(new URL(defaultPath, request.url));
      }

    } catch (error) {
      console.error('Token error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};