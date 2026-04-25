import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EstadoTicket, PrioridadTicket } from "@/types";

// shadcn utility — combina clases Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Fechas ────────────────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Archivos ──────────────────────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ESTADO_LABELS: Record<EstadoTicket, string> = {
  abierto:    "Abierto",
  en_proceso: "En Proceso",
  cerrado:    "Cerrado",
};

export const ESTADO_COLORS: Record<EstadoTicket, string> = {
  abierto:    "bg-blue-100 text-blue-800",
  en_proceso: "bg-yellow-100 text-yellow-800",
  cerrado:    "bg-green-100 text-green-800",
};

export const PRIORIDAD_LABELS: Record<PrioridadTicket, string> = {
  baja:    "Baja",
  media:   "Media",
  alta:    "Alta",
  critica: "Crítica",
};

export const PRIORIDAD_COLORS: Record<PrioridadTicket, string> = {
  baja:    "bg-gray-100 text-gray-700",
  media:   "bg-blue-100 text-blue-700",
  alta:    "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-800",
};
