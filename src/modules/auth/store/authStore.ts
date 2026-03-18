import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  userId: string;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  // Acciones
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      
      logout: () => {
        set({ token: null, user: null });
        Cookies.remove('auth_token');
      },
    }),
    {
      name: 'auth-storage', // Persistencia en localStorage
    }
  )
);