import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada correctamente" });

  // Borramos la cookie que el middleware valida
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    maxAge: 0, // Expira inmediatamente
    path: "/",
  });

  return response;
}