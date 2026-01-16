import { LoginRequest } from "@/src/modules/auth/types";

export const authService = {
  async login(credentials: LoginRequest) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include", // Incluir cookies en la solicitud y guardarlas
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }
    return response.json();
  },

  async logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Incluir cookies en la solicitud
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión en el servidor");
    }
  }
};