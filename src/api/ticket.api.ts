import apiClient from "./client";
import type { Ticket, TicketDetail, TicketCreate, Observacion, Evidencia } from "@/types";

export const ticketApi = {
  getAll: async (params?: {
    estado?: string;
    prioridad?: string;
    area_id?: string;
    tipo_servicio_id?: string;
  }): Promise<Ticket[]> => {
    const res = await apiClient.get<Ticket[]>("/tickets", { params });
    return res.data;
  },

  getMisTickets: async (): Promise<Ticket[]> => {
    const res = await apiClient.get<Ticket[]>("/tickets/mis-tickets");
    return res.data;
  },

  getById: async (id: string): Promise<TicketDetail> => {
    const res = await apiClient.get<TicketDetail>(`/tickets/${id}`);
    return res.data;
  },

  create: async (data: TicketCreate): Promise<TicketDetail> => {
    const res = await apiClient.post<TicketDetail>("/tickets", data);
    return res.data;
  },

  asignar: async (id: string, agente_ids: string[]): Promise<TicketDetail> => {
    const res = await apiClient.post<TicketDetail>(`/tickets/${id}/asignar`, {
      agente_ids,
    });
    return res.data;
  },

  reasignar: async (id: string, agente_ids: string[]): Promise<TicketDetail> => {
    const res = await apiClient.post<TicketDetail>(`/tickets/${id}/reasignar`, {
      agente_ids,
    });
    return res.data;
  },

  cambiarEstado: async (id: string, estado: string): Promise<TicketDetail> => {
    const res = await apiClient.patch<TicketDetail>(`/tickets/${id}/estado`, {
      estado,
    });
    return res.data;
  },

  // Observaciones
  getObservaciones: async (ticketId: string): Promise<Observacion[]> => {
    const res = await apiClient.get<Observacion[]>(
      `/tickets/${ticketId}/observaciones`
    );
    return res.data;
  },

  addObservacion: async (
    ticketId: string,
    contenido: string
  ): Promise<Observacion> => {
    const res = await apiClient.post<Observacion>(
      `/tickets/${ticketId}/observaciones`,
      { contenido }
    );
    return res.data;
  },

  // Evidencias
  getEvidencias: async (ticketId: string): Promise<Evidencia[]> => {
    const res = await apiClient.get<Evidencia[]>(
      `/tickets/${ticketId}/evidencias`
    );
    return res.data;
  },

  subirEvidencia: async (
    ticketId: string,
    archivo: File,
    onProgress?: (pct: number) => void
  ): Promise<Evidencia> => {
    const form = new FormData();
    form.append("archivo", archivo);
    const res = await apiClient.post<Evidencia>(
      `/tickets/${ticketId}/evidencias`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      }
    );
    return res.data;
  },
};
