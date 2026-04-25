import apiClient from "./client";
import type { Usuario, UsuarioCreate, UsuarioUpdate } from "@/types";

export const usuarioApi = {
  getAll: async (params?: {
    rol?: string;
    solo_activos?: boolean;
  }): Promise<Usuario[]> => {
    const res = await apiClient.get<Usuario[]>("/usuarios", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const res = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return res.data;
  },

  create: async (data: UsuarioCreate): Promise<Usuario> => {
    const res = await apiClient.post<Usuario>("/usuarios", data);
    return res.data;
  },

  update: async (id: string, data: UsuarioUpdate): Promise<Usuario> => {
    const res = await apiClient.put<Usuario>(`/usuarios/${id}`, data);
    return res.data;
  },

  cambiarPassword: async (
    id: string,
    passwordActual: string,
    passwordNuevo: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.patch(`/usuarios/${id}/password`, {
      password_actual: passwordActual,
      password_nuevo: passwordNuevo,
    });
    return res.data;
  },

  desactivar: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/usuarios/${id}`);
    return res.data;
  },
};
