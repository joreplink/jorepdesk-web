import apiClient from "./client";
import type { TipoServicio, TipoServicioCreate, Area, AreaCreate } from "@/types";

export const catalogoApi = {
  // Tipos de servicio
  getTipoServicios: async (soloActivos = false): Promise<TipoServicio[]> => {
    const res = await apiClient.get<TipoServicio[]>("/tipo-servicios", {
      params: { solo_activos: soloActivos },
    });
    return res.data;
  },

  createTipoServicio: async (data: TipoServicioCreate): Promise<TipoServicio> => {
    const res = await apiClient.post<TipoServicio>("/tipo-servicios", data);
    return res.data;
  },

  updateTipoServicio: async (
    id: string,
    data: Partial<TipoServicioCreate & { activo: boolean }>
  ): Promise<TipoServicio> => {
    const res = await apiClient.put<TipoServicio>(`/tipo-servicios/${id}`, data);
    return res.data;
  },

  deleteTipoServicio: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/tipo-servicios/${id}`);
    return res.data;
  },

  // Áreas
  getAreas: async (soloActivos = false): Promise<Area[]> => {
    const res = await apiClient.get<Area[]>("/areas", {
      params: { solo_activos: soloActivos },
    });
    return res.data;
  },

  createArea: async (data: AreaCreate): Promise<Area> => {
    const res = await apiClient.post<Area>("/areas", data);
    return res.data;
  },

  updateArea: async (
    id: string,
    data: Partial<AreaCreate & { activo: boolean }>
  ): Promise<Area> => {
    const res = await apiClient.put<Area>(`/areas/${id}`, data);
    return res.data;
  },

  deleteArea: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/areas/${id}`);
    return res.data;
  },
};
