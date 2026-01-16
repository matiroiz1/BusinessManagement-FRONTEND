import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Debug en terminal para saber que está vivo
  console.log(`🛡️ [Middleware] Ruta: ${pathname} | Token: ${token ? "✅" : "❌"}`);
  
  // Protección: Si vas al dashboard y no tienes token -> Login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      // Opcional: guardar url de retorno
      // loginUrl.searchParams.set("callbackUrl", pathname); 
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirección: Si ya tienes token y vas al login -> Dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",        // Protege la raíz exacta
    "/dashboard/:path*", // Protege subrutas
    "/login",
  ],
};