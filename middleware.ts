import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protección de rutas a nivel servidor (Edge Runtime).
 *
 * Rutas protegidas → requieren cookie `sangria-session`.
 * Si no existe → redirige a /login?redirect=<ruta-original>.
 *
 * La cookie la setea AuthContext en el browser al hacer login/register.
 * La verificación real del JWT ocurre en las API routes (lib/auth.ts).
 * Esto es protección de navegación (UX), no seguridad de datos.
 */

const PROTECTED_PATHS = ['/cuenta', '/checkout', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get('sangria-session');

  if (!session?.value) {
    // Redirigir al login guardando la ruta original para volver después
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Solo corre el middleware en estas rutas (no en assets, api, _next)
  matcher: ['/cuenta/:path*', '/checkout/:path*', '/admin/:path*'],
};
