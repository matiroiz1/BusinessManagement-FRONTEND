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

  console.log(`🚀 Cliente: Enviando petición a ${baseUrl}${path}`);

  // Fallback: intentar obtener token de localStorage si las cookies no funcionan
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 Enviando token desde localStorage: ${token.substring(0, 10)}...`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Importante: enviar cookies de autenticación
  });

  console.log(`👀 Cliente: Cookies enviadas: ${document.cookie}`);
  if (token) {
    console.log(`🔑 Token desde localStorage: ${token.substring(0, 10)}...`);
  }

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