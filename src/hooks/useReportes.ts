import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reporteApi, descargarArchivo } from "@/api/reporte.api";
import type { ReporteParams } from "@/types";

export function useReportes() {
  return useQuery({
    queryKey: ["reportes"],
    queryFn: reporteApi.getAll,
  });
}

export function useReporte(id: string) {
  return useQuery({
    queryKey: ["reportes", id],
    queryFn: () => reporteApi.getById(id),
    enabled: !!id,
  });
}

export function useGenerarReporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ReporteParams) => reporteApi.generar(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reportes"] }),
  });
}

export function useExportarPdf() {
  return useMutation({
    mutationFn: (id: string) => reporteApi.exportarPdf(id),
    onSuccess: (blob, id) => descargarArchivo(blob, `reporte_${id.slice(0, 8)}.pdf`),
  });
}

export function useExportarExcel() {
  return useMutation({
    mutationFn: (id: string) => reporteApi.exportarExcel(id),
    onSuccess: (blob, id) => descargarArchivo(blob, `reporte_${id.slice(0, 8)}.xlsx`),
  });
}
