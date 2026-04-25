import apiClient from "./client";
import type { Reporte, ReporteParams } from "@/types";

export const reporteApi = {
  getAll: async (): Promise<Reporte[]> => {
    const res = await apiClient.get<Reporte[]>("/reportes");
    return res.data;
  },

  getById: async (id: string): Promise<Reporte> => {
    const res = await apiClient.get<Reporte>(`/reportes/${id}`);
    return res.data;
  },

  generar: async (params: ReporteParams): Promise<Reporte> => {
    const res = await apiClient.post<Reporte>("/reportes", params);
    return res.data;
  },

  exportarPdf: async (id: string): Promise<Blob> => {
    const res = await apiClient.get(`/reportes/${id}/exportar/pdf`, {
      responseType: "blob",
    });
    return res.data;
  },

  exportarExcel: async (id: string): Promise<Blob> => {
    const res = await apiClient.get(`/reportes/${id}/exportar/excel`, {
      responseType: "blob",
    });
    return res.data;
  },
};

// Helper para descargar un blob como archivo
export function descargarArchivo(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
