import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ error: data.message || "Error" }, { status: backendRes.status });
    }

    const token = data.accessToken || data.access_token || data.token;
    const response = NextResponse.json({
      userId: data.userId,
      username: data.username,
      role: data.role,
    });

    // ============================================================
    // 🟢 MODO DESARROLLO (ACTIVO)
    // Permite que el JS del frontend lea la cookie para guardarla en localStorage
    // ============================================================
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: false, // IMPORTANTE: false para que el cliente pueda leerla en dev
      secure: false,   // false porque es localhost
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    // ============================================================
    // 🔒 MODO PRODUCCIÓN (COMENTADO - USAR AL DEPLOYAR)
    // ============================================================
    /*
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true, // Seguridad total: JS no puede leerla
      secure: true,   // Solo HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    */

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}