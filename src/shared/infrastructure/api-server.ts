// src/shared/infrastructure/api-server.ts
import { cookies } from "next/headers";

export async function apiFetchServer(path: string, options: RequestInit = {}) {
  // En el servidor, nos comunicamos Back-to-Back con Spring Boot
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  // console.log(`🌍 [SERVER] Fetching: ${backendUrl}${path}`);

  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store", // Para evitar caché agresivo en Next.js
  });

  if (!response.ok) {
    // Manejo básico de errores
    const errorBody = await response.text(); 
    throw new Error(`Error ${response.status}: ${errorBody}`);
  }

  return response.json();
}