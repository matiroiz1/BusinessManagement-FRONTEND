// src/app/api/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Asegúrate de que apunte a tu Spring Boot (8080)
const SPRING_API_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  // 1. Reconstruir la ruta (ej: /api/catalog/products -> catalog/products)
  const path = params.path.join("/");
  
  // 2. Obtener el token de la cookie HttpOnly
  const cookieStore = cookies();
  const allCookies = (await cookieStore).getAll();
  console.log("🍪 Todas las cookies recibidas:", allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 10) + '...' })));
  
  const token = (await cookieStore).get("auth_token")?.value;
  
  // 3. Obtener los Query Params (ej: ?page=0&size=10)
  const queryString = request.nextUrl.search;
  
  // 4. Construir la URL destino
  const destinationUrl = `${SPRING_API_URL}/api/${path}${queryString}`;

  console.log(`🔀 Proxying ${request.method} a: ${destinationUrl}`);
  console.log(`🔍 Token encontrado: ${token ? 'SÍ' : 'NO'}`);
  if (token) {
    console.log(`🔑 Token (primeros 10 chars): ${token.substring(0, 10)}`);
  }

  try {
    // 5. Reenviar la petición a Spring Boot con el Token
    const backendResponse = await fetch(destinationUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // ¡AQUÍ ESTÁ LA MAGIA! Inyectamos el token
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // Si es GET no mandamos body, si es POST/PUT sí
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.json().then(JSON.stringify).catch(() => undefined),
    });

    // 6. Procesar la respuesta
    const data = await backendResponse.json().catch(() => ({}));

    // Si Spring Boot devuelve error, lo devolvemos tal cual
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error("❌ Error en Proxy Catch-All:", error);
    return NextResponse.json({ error: "Error de conexión con el Backend" }, { status: 500 });
  }
}

// Exportamos el handler para todos los métodos HTTP
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };