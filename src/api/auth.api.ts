import apiClient from "./client";
import type { LoginRequest, TokenResponse, Usuario } from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/login", data);
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const res = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return res.data;
  },

  me: async (): Promise<{ user: Usuario }> => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
};
