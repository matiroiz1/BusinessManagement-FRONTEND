import { LoginRequest } from "@/src/modules/auth/types";

export const authService = {
  async login(credentials: LoginRequest) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include", 
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }
    
    const data = await response.json();

    // ============================================================
    // 🟢 MODO DESARROLLO (ACTIVO) - Fallback a LocalStorage
    // ============================================================
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (token) {
        localStorage.setItem('auth_token', token);
        console.log('🔧 DEV: Token guardado en localStorage');
      }
    }

    // ============================================================
    // 🔒 MODO PRODUCCIÓN (COMENTADO)
    // No hacemos nada, la cookie HttpOnly se maneja sola.
    // ============================================================

    return data;
  },

  async logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // En DEV limpiamos localStorage también
    if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
  }
};