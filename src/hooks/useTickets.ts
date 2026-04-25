import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "@/api/ticket.api";
import type { TicketCreate } from "@/types";

export const ticketKeys = {
  all:       () => ["tickets"] as const,
  lists:     () => [...ticketKeys.all(), "list"] as const,
  list:      (f: object) => [...ticketKeys.lists(), f] as const,
  detail:    (id: string) => [...ticketKeys.all(), "detail", id] as const,
  misList:   () => ["mis-tickets"] as const,
  obs:       (id: string) => ["observaciones", id] as const,
  evidencias:(id: string) => ["evidencias", id] as const,
};

// ── Listados ──────────────────────────────────────────────────────────────────

export function useTickets(filtros?: {
  estado?: string;
  prioridad?: string;
  area_id?: string;
  tipo_servicio_id?: string;
}) {
  return useQuery({
    queryKey: ticketKeys.list(filtros ?? {}),
    queryFn: () => ticketApi.getAll(filtros),
  });
}

export function useMisTickets() {
  return useQuery({
    queryKey: ticketKeys.misList(),
    queryFn: ticketApi.getMisTickets,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketApi.getById(id),
    enabled: !!id,
  });
}

// ── Mutaciones ────────────────────────────────────────────────────────────────

export function useCrearTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCreate) => ticketApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.lists() }),
  });
}

export function useAsignarTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agente_ids: string[]) => ticketApi.asignar(ticketId, agente_ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      qc.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

export function useReasignarTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agente_ids: string[]) => ticketApi.reasignar(ticketId, agente_ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      qc.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

export function useCambiarEstado(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estado: string) => ticketApi.cambiarEstado(ticketId, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      qc.invalidateQueries({ queryKey: ticketKeys.lists() });
      qc.invalidateQueries({ queryKey: ticketKeys.misList() });
    },
  });
}

// ── Observaciones ─────────────────────────────────────────────────────────────

export function useObservaciones(ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.obs(ticketId),
    queryFn: () => ticketApi.getObservaciones(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddObservacion(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contenido: string) =>
      ticketApi.addObservacion(ticketId, contenido),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ticketKeys.obs(ticketId) }),
  });
}

// ── Evidencias ────────────────────────────────────────────────────────────────

export function useEvidencias(ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.evidencias(ticketId),
    queryFn: () => ticketApi.getEvidencias(ticketId),
    enabled: !!ticketId,
  });
}

export function useSubirEvidencia(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archivo: File) => ticketApi.subirEvidencia(ticketId, archivo),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ticketKeys.evidencias(ticketId) }),
  });
}
