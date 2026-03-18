import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Evitar que el middleware intercepte estáticos o next internals (Previene bucles de recursos)
  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // 2. Rutas Protegidas de ADMIN/DASHBOARD
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // Guardamos la url de retorno
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    // NOTA: Aquí podrías validar el rol con 'jose' si quieres seguridad extra,
    // pero si el token es inválido, la API (api-client) lo rechazará y lo sacará.
  }

  // 3. Rutas de Autenticación (Login/Register)
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      // Si ya tiene token, no lo dejamos entrar al login, lo mandamos al home o dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  // Matcher excluyendo archivos estáticos para no saturar el servidor
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};