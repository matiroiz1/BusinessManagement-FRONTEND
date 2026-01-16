import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  userId: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        try {
          // 1. Llamamos al servicio para borrar la cookie HttpOnly
          await authService.logout();
        } catch (error) {
          console.error("Logout falló en servidor, limpiando local de todos modos", error);
        } finally {
          // 2. Limpiamos el estado de Zustand (UI y localStorage)
          set({ user: null });
          // 3. Redirigimos manualmente al login
          window.location.href = "/login";
        }
      },
    }),
    { name: 'auth-storage' }
  )
);