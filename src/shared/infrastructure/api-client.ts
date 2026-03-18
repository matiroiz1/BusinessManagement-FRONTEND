import { guestManager } from "@/src/shared/utils/guest-manager";
import { toast } from "sonner";

// Helper para leer cookies manualmente en el cliente
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export async function apiFetchClient(endpoint: string, options: RequestInit = {}) {
  // Aseguramos que apunte al Backend Spring Boot
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  // Normalizamos el endpoint
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // ------------------------------------------------------------
  // 🛡️ ESTRATEGIA DEFENSIVA (FALLBACK)
  // ------------------------------------------------------------
  
  // 1. SIEMPRE generamos/enviamos el Guest ID como respaldo.
  //    Esto evita el error "header missing" si el backend decide ignorar el token.
  const guestId = guestManager.getOrCreateGuestId();
  if (guestId) {
    headers['X-Guest-ID'] = guestId;
  }

  // 2. Si hay token, TAMBIÉN lo enviamos.
  //    El backend intentará usar este primero.
  const token = getCookie("auth_token");
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Realizar la petición
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // ------------------------------------------------------------
  // 🚨 MANEJO DE ERROR 401
  // ------------------------------------------------------------
  if (response.status === 401) {
    console.error("⛔ Sesión expirada o token inválido");
    
    if (typeof window !== "undefined") {
      // Solo si estábamos intentando usar un token, limpiamos y redirigimos.
      // Si era un invitado puro, no hacemos nada (solo mostramos error).
      if (token) {
          // 1. Borrar la cookie corrupta
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          
          // 2. Redirigir al login solo si no estamos ya allí
          if (!window.location.pathname.includes("/login")) {
             window.location.href = "/login";
          }
      }
    }
    throw new Error("Sesión expirada o no autorizada");
  }

  // Manejo de 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  // Manejo de Errores Generales
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // Parsear respuesta
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}