// src/shared/infrastructure/api-client.ts
"use client";

export async function apiFetchClient(path: string, options: RequestInit = {}) {
  // En el cliente, llamamos a nuestra propia API de Next.js (/api/...)
  // El navegador envía las cookies automáticamente a nuestro propio dominio.
  const baseUrl = "/api"; 
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Si la sesión expiró, redirigimos al login
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}