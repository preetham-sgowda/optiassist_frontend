import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // For now, allow all routes through since we are using mock auth.
  // When Supabase is connected, replace this with proper session checks.
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login')

  // Pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
