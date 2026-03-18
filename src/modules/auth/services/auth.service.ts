import { LoginRequest, LoginResponse } from "@/src/modules/auth/types";
import { apiFetchClient } from "@/src/shared/infrastructure/api-client";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // We use the shared apiFetchClient if available, or fetch directly.
    // Using direct fetch here to ensure we handle the response manually for the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }
    
    return await response.json();
  },

  async logout() {
    // Call backend to invalidate session if applicable
    // Note: Since we are using client-side cookies for this MVP, 
    // the backend logout might not be strictly necessary if it's stateless JWT,
    // but good practice to keep.
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/logout`, { method: "POST" });
    } catch (e) {
        // Ignore errors on logout
    }
  },
  async getMe(): Promise<LoginResponse> {
    // Usamos apiFetchClient que ya maneja el token en el header automáticamente
    // IMPORTANTE: Method GET para evitar el error 405
    return await apiFetchClient("/auth/me", { method: "GET" });
  }
};