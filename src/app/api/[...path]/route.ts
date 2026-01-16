import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SPRING_API_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Reconstruir la ruta
  const path = params.path.join("/");
  
  // Obtener el token de la cookie HttpOnly
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token")?.value;

  // Obtener Query Params
  const queryString = request.nextUrl.search;
  const destinationUrl = `${SPRING_API_URL}/api/${path}${queryString}`;

  // console.log(`Proxying ${request.method} to: ${destinationUrl}`);

  try {
    const backendResponse = await fetch(destinationUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // Inyectamos el token si existe en la cookie
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // Si es GET/HEAD no enviamos body
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.json().then(JSON.stringify).catch(() => undefined),
    });

    // Si el backend devuelve 401, significa que el token expiró o es inválido
    if (backendResponse.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await backendResponse.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error("Error en Proxy Catch-All:", error);
    return NextResponse.json({ error: "Error de conexión con el Backend" }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };