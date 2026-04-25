import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "@/types"

interface AuthState {
  user: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setAuth: (user: Usuario, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;

  // Computed helpers
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isAgente: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        // Guarda también en localStorage para el interceptor de Axios
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().accessToken && !!get().user,
      isAdmin: () => get().user?.rol === "admin",
      isAgente: () => get().user?.rol === "agente",
    }),
    {
      name: "helpdesk-auth",
      // Solo persiste estos campos en localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
