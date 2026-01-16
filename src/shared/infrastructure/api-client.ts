"use client";

export async function apiFetchClient(path: string, options: RequestInit = {}) {
  const baseUrl = "/api"; 
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // ============================================================
  // 🟢 MODO DESARROLLO (ACTIVO) - Inyección Manual
  // ============================================================
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ============================================================
  // 🔒 MODO PRODUCCIÓN (COMENTADO)
  // No inyectamos nada, el Proxy lee la cookie HttpOnly
  // ============================================================
  
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include', 
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  // --- NUEVO: Manejo de 204 No Content ---
  // Si el backend dice "No hay contenido", devolvemos null y no da error.
  if (response.status === 204) {
    return null;
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}