import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Rutas públicas (sin protección)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/reservar",
  "/mis-citas",
  "/api/auth",
  "/api/auth/register",
];

// Rutas del dashboard (requieren autenticación)
const DASHBOARD_ROUTES = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Proxy] 🔍 Checking route: ${pathname}`);

  // Si es una ruta pública, permitir acceso
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    console.log(`[Proxy] ✅ Public route allowed`);
    return NextResponse.next();
  }

  // Si es una ruta del dashboard, verificar sesión
  const isDashboardRoute = DASHBOARD_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isDashboardRoute) {
    console.log(`[Proxy] 🔐 Dashboard route, checking token...`);

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(`[Proxy] Token present: ${!!token}`);
    console.log(`[Proxy] Token role: ${token?.role}`);

    if (!token) {
      console.log(`[Proxy] ❌ No token, redirecting to login`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar permisos por rol
    const userRole = token.role as string;
    if (!["ADMIN", "STAFF"].includes(userRole || "")) {
      console.log(`[Proxy] ❌ Invalid role, redirecting to /`);
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log(`[Proxy] ✅ Token valid, allowing access`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
