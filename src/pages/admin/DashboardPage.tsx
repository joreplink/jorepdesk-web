import { useTickets } from "@/hooks/useTickets";
import { useAgentes } from "@/hooks/useUsuarios";
import { useTipoServicios } from "@/hooks/useCatalogos";
import type  { Ticket } from "@/types";
import { ESTADO_COLORS, ESTADO_LABELS, PRIORIDAD_COLORS, PRIORIDAD_LABELS, formatDateTime } from "@/utils";
import { Ticket as TicketIcon, Users, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, icon: Icon, color, sub,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Ticket row ────────────────────────────────────────────────────────────────
function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-sm font-mono text-blue-600">{ticket.numero}</td>
      <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{ticket.titulo}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[ticket.estado]}`}>
          {ESTADO_LABELS[ticket.estado]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
          {PRIORIDAD_LABELS[ticket.prioridad]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{ticket.area.nombre}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(ticket.creado_en)}</td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useTickets();
  const { data: agentes = [] } = useAgentes();
  const { data: tipoServicios = [] } = useTipoServicios();

  // KPIs
  const abiertos   = tickets.filter((t) => t.estado === "abierto").length;
  const enProceso  = tickets.filter((t) => t.estado === "en_proceso").length;
  const cerrados   = tickets.filter((t) => t.estado === "cerrado").length;
  const criticos   = tickets.filter((t) => t.prioridad === "critica" && t.estado !== "cerrado").length;

  // Datos para PieChart — estados
  const pieData = [
    { name: "Abiertos",   value: abiertos,  color: "#3b82f6" },
    { name: "En Proceso", value: enProceso, color: "#f59e0b" },
    { name: "Cerrados",   value: cerrados,  color: "#10b981" },
  ].filter((d) => d.value > 0);

  // Datos para BarChart — tickets por tipo de servicio
  const porTipo = tipoServicios.map((ts) => ({
    name: ts.nombre.length > 15 ? ts.nombre.slice(0, 15) + "…" : ts.nombre,
    total: tickets.filter((t) => t.tipo_servicio.id === ts.id).length,
  })).filter((d) => d.total > 0);

  // Últimos 8 tickets
  const recientes = [...tickets]
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Resumen general del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tickets"
          value={tickets.length}
          icon={TicketIcon}
          color="bg-blue-500"
          sub="todos los registros"
        />
        <KpiCard
          title="Abiertos"
          value={abiertos}
          icon={Clock}
          color="bg-yellow-500"
          sub="pendientes de atención"
        />
        <KpiCard
          title="En Proceso"
          value={enProceso}
          icon={AlertCircle}
          color="bg-orange-500"
          sub="siendo atendidos"
        />
        <KpiCard
          title="Cerrados"
          value={cerrados}
          icon={CheckCircle}
          color="bg-green-500"
          sub="resueltos"
        />
      </div>

      {/* Fila secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Agentes activos"
          value={agentes.filter((a) => a.activo).length}
          icon={Users}
          color="bg-purple-500"
        />
        <KpiCard
          title="Tipos de servicio"
          value={tipoServicios.filter((t) => t.activo).length}
          icon={TicketIcon}
          color="bg-slate-500"
        />
        {criticos > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">⚠️ Tickets Críticos</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{criticos}</p>
                  <p className="text-xs text-red-400 mt-0.5">sin resolver</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficas */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie — estados */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Tickets por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar — por tipo de servicio */}
          {porTipo.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Tickets por Tipo de Servicio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={porTipo} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tickets recientes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Tickets Recientes
            </CardTitle>
            <button
              onClick={() => navigate("/tickets")}
              className="text-xs text-blue-600 hover:underline"
            >
              Ver todos →
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recientes.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              No hay tickets registrados aún.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">N°</th>
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">Título</th>
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">Estado</th>
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">Prioridad</th>
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">Área</th>
                    <th className="px-4 py-2 text-xs font-semibold text-slate-500">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recientes.map((t) => (
                    <TicketRow
                      key={t.id}
                      ticket={t}
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
