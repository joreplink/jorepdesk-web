import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogoApi } from "@/api/catalogo.api";
import type { TipoServicioCreate, AreaCreate } from "@/types";

// ── Tipos de Servicio ─────────────────────────────────────────────────────────

export function useTipoServicios(soloActivos = false) {
  return useQuery({
    queryKey: ["tipo-servicios", soloActivos],
    queryFn: () => catalogoApi.getTipoServicios(soloActivos),
  });
}

export function useCrearTipoServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TipoServicioCreate) =>
      catalogoApi.createTipoServicio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipo-servicios"] }),
  });
}

export function useUpdateTipoServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TipoServicioCreate & { activo: boolean }> }) =>
      catalogoApi.updateTipoServicio(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipo-servicios"] }),
  });
}

export function useDeleteTipoServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogoApi.deleteTipoServicio(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tipo-servicios"] }),
  });
}

// ── Áreas ─────────────────────────────────────────────────────────────────────

export function useAreas(soloActivos = false) {
  return useQuery({
    queryKey: ["areas", soloActivos],
    queryFn: () => catalogoApi.getAreas(soloActivos),
  });
}

export function useCrearArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AreaCreate) => catalogoApi.createArea(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["areas"] }),
  });
}

export function useUpdateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AreaCreate & { activo: boolean }> }) =>
      catalogoApi.updateArea(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["areas"] }),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogoApi.deleteArea(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["areas"] }),
  });
}
