import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuarioApi } from "@/api/usuario.api";
import type { UsuarioCreate, UsuarioUpdate } from "@/types";

export function useUsuarios(params?: { rol?: string; solo_activos?: boolean }) {
  return useQuery({
    queryKey: ["usuarios", params],
    queryFn: () => usuarioApi.getAll(params),
  });
}

export function useAgentes(soloActivos = true) {
  return useQuery({
    queryKey: ["usuarios", { rol: "agente", solo_activos: soloActivos }],
    queryFn: () => usuarioApi.getAll({ rol: "agente", solo_activos: soloActivos }),
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioCreate) => usuarioApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UsuarioUpdate }) =>
      usuarioApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useDesactivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuarioApi.desactivar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
