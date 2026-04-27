import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerarReporte, useReportes, useReporte, useExportarPdf, useExportarExcel } from "@/hooks/useReportes";
import { useAreas } from "@/hooks/useCatalogos";
import { useAgentes } from "@/hooks/useUsuarios";
import { useTipoServicios } from "@/hooks/useCatalogos";
import type { Reporte, TipoReporte, TicketResumenMetrica } from "@/types";
import { formatDate, formatDateTime } from "@/utils";
import {
  BarChart2, FileText, Download, Loader2,
  ChevronRight, FileSpreadsheet, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  tipo:         z.enum(["por_tipo_servicio", "por_area", "por_agente"]),
  filtro_id:    z.string().optional(),
  fecha_inicio: z.string().min(1, "Selecciona fecha inicio"),
  fecha_fin:    z.string().min(1, "Selecciona fecha fin"),
}).refine((d) => d.fecha_inicio <= d.fecha_fin, {
  message: "La fecha inicio no puede ser posterior a la fecha fin",
  path: ["fecha_fin"],
});

type FormData = z.infer<typeof schema>;

// ── Tipo labels ───────────────────────────────────────────────────────────────
const TIPO_LABELS: Record<TipoReporte, string> = {
  por_tipo_servicio: "Por Tipo de Servicio",
  por_area:          "Por Área",
  por_agente:        "Por Agente",
};

// ── Fila métrica ──────────────────────────────────────────────────────────────
function FilaMetrica({ m }: { m: TicketResumenMetrica }) {
  const pct = m.total > 0 ? Math.round((m.cerrados / m.total) * 100) : 0;
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-slate-800">{m.nombre}</td>
      <td className="px-4 py-3 text-sm text-center font-semibold text-slate-700">{m.total}</td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{m.abiertos}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{m.en_proceso}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{m.cerrados}</span>
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate-500">
        {m.promedio_horas_cierre != null ? `${m.promedio_horas_cierre.toFixed(1)}h` : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-8">{pct}%</span>
        </div>
      </td>
    </tr>
  );
}

// ── Detalle reporte ───────────────────────────────────────────────────────────
function DetalleReporte({ reporteId }: { reporteId: string }) {
  const { data: reporte, isLoading } = useReporte(reporteId);
  const exportPdf   = useExportarPdf();
  const exportExcel = useExportarExcel();

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="animate-spin text-blue-500" size={28} />
    </div>
  );

  if (!reporte) return null;

  const chartData = reporte.metricas.map((m) => ({
    name:       m.nombre.length > 16 ? m.nombre.slice(0, 16) + "…" : m.nombre,
    Abiertos:   m.abiertos,
    "En Proceso": m.en_proceso,
    Cerrados:   m.cerrados,
  }));

  return (
    <div className="space-y-5">
      {/* Header reporte */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge>{TIPO_LABELS[reporte.tipo]}</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Período: <strong>{formatDate(reporte.fecha_inicio)}</strong> al <strong>{formatDate(reporte.fecha_fin)}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Generado por {reporte.generado_por.nombre} {reporte.generado_por.apellido} · {formatDateTime(reporte.generado_en)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-800">{reporte.total_tickets}</p>
              <p className="text-xs text-slate-400">tickets totales</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button
              size="sm" variant="outline"
              onClick={() => exportPdf.mutate(reporteId, {
                onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error al exportar PDF"),
              })}
              disabled={exportPdf.isPending}
            >
              {exportPdf.isPending
                ? <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                : <FileText className="mr-2 h-3 w-3" />}
              Exportar PDF
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => exportExcel.mutate(reporteId, {
                onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error al exportar Excel"),
              })}
              disabled={exportExcel.isPending}
            >
              {exportExcel.isPending
                ? <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                : <FileSpreadsheet className="mr-2 h-3 w-3" />}
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfica */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Distribución de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Abiertos"   fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="En Proceso" fill="#f59e0b" radius={[3,3,0,0]} />
                <Bar dataKey="Cerrados"   fill="#10b981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabla de métricas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Detalle por {TIPO_LABELS[reporte.tipo]}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reporte.metricas.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No hay datos para el período seleccionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Nombre", "Total", "Abiertos", "En Proceso", "Cerrados", "Prom. Cierre", "Resolución"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center first:text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reporte.metricas.map((m, i) => <FilaMetrica key={i} m={m} />)}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportesPage() {
  const { data: reportes = [], isLoading: loadingLista } = useReportes();
  const { data: areas = [] }         = useAreas(true);
  const { data: agentes = [] }       = useAgentes(true);
  const { data: tipoServicios = [] } = useTipoServicios(true);
  const generar = useGenerarReporte();

  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoReporte>("por_area");

  const hoy = new Date().toISOString().split("T")[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        tipo: "por_area",
        fecha_inicio: inicioMes,
        fecha_fin: hoy,
      },
    });

  const tipoActual = watch("tipo");

  // Opciones de filtro según tipo
  const opcionesFiltro: { id: string; nombre: string }[] =
    tipoActual === "por_area"          ? areas :
    tipoActual === "por_agente"        ? agentes.map((a) => ({ id: a.id, nombre: `${a.nombre} ${a.apellido}` })) :
    tipoActual === "por_tipo_servicio" ? tipoServicios : [];

  const onSubmit = (data: FormData) => {
    generar.mutate(
      { ...data, filtro_id: data.filtro_id || undefined },
      {
        onSuccess: (r) => {
          toast.success("Reporte generado");
          setReporteActivo(r.id);
        },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error al generar reporte"),
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Genera y exporta reportes del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel izquierdo — formulario + historial */}
        <div className="space-y-4">
          {/* Formulario generar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BarChart2 size={15} /> Generar Reporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label>Tipo de Reporte</Label>
                  <Select
                    defaultValue="por_area"
                    onValueChange={(v) => {
                      setValue("tipo", v as TipoReporte);
                      setValue("filtro_id", "");
                      setTipoSeleccionado(v as TipoReporte);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="por_area">Por Área</SelectItem>
                      <SelectItem value="por_tipo_servicio">Por Tipo de Servicio</SelectItem>
                      <SelectItem value="por_agente">Por Agente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro específico */}
                {opcionesFiltro.length > 0 && (
                  <div className="space-y-1.5">
                    <Label>Filtrar por (opcional)</Label>
                    <Select onValueChange={(v) => setValue("filtro_id", v === "todos" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {opcionesFiltro.map((o) => (
                          <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Fechas */}
                <div className="space-y-1.5">
                  <Label>Fecha Inicio</Label>
                  <Input type="date" {...register("fecha_inicio")} />
                  {errors.fecha_inicio && (
                    <p className="text-red-500 text-xs">{errors.fecha_inicio.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha Fin</Label>
                  <Input type="date" {...register("fecha_fin")} />
                  {errors.fecha_fin && (
                    <p className="text-red-500 text-xs">{errors.fecha_fin.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={generar.isPending}>
                  {generar.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
                    : <><RefreshCw className="mr-2 h-4 w-4" />Generar</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historial de reportes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Reportes Anteriores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingLista ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-400" size={20} />
                </div>
              ) : reportes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin reportes generados</p>
              ) : (
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {reportes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReporteActivo(r.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                        reporteActivo === r.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {TIPO_LABELS[r.tipo]}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(r.fecha_inicio)} → {formatDate(r.fecha_fin)}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho — detalle del reporte activo */}
        <div className="lg:col-span-2">
          {reporteActivo ? (
            <DetalleReporte reporteId={reporteActivo} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <BarChart2 size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Genera un reporte para verlo aquí</p>
              <p className="text-xs mt-1">o selecciona uno del historial</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
