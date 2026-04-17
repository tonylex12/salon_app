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

  // Si es una ruta pública, permitir acceso
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si es una ruta del dashboard, verificar sesión
  const isDashboardRoute = DASHBOARD_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isDashboardRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar permisos por rol
    const userRole = token.role as string;
    if (!userRole || !["ADMIN", "STAFF"].includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
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
