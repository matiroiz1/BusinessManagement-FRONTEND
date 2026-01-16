// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("🔵 Intentando login con:", body.username);

    // 1. Llamada al Backend
    const backendRes = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    console.log("🟢 Respuesta de Spring Boot:", data); // ¡MIRA ESTO EN LA TERMINAL!

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || "Credenciales inválidas" },
        { status: backendRes.status }
      );
    }

    // VERIFICACIÓN CLAVE: ¿Cómo se llama el campo del token?
    // A veces Spring devuelve 'access_token' en lugar de 'accessToken'
    const token = data.accessToken || data.access_token || data.token;

    if (!token) {
      console.error("🔴 ERROR: No se encontró el token en la respuesta del back");
      return NextResponse.json(
        { error: "Error de protocolo: Backend no envió token" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      userId: data.userId,
      username: data.username,
      role: data.role,
      // accessToken: token, // Opcional: devolverlo para verlo en el front
    });

    // 3. Seteamos la cookie FORZANDO secure: false para localhost
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: false, // <--- CAMBIO IMPORTANTE PARA LOCALHOST
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    console.log("🍪 Cookie seteada con token (primeros 10 chars):", token.substring(0, 10));

    return response;
  } catch (error) {
    console.error("Error crítico en /api/auth/login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}