import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import type { LoginRequest } from "@/types";

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token, res.refresh_token);
      // Redirige según rol
      if (res.user.rol === "admin") {
        navigate("/");
      } else {
        navigate("/mis-tickets");
      }
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return () => {
    clearAuth();
    navigate("/login");
  };
}
