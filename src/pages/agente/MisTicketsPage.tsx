import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMisTickets } from "@/hooks/useTickets";
import type { Ticket } from "@/types";
import {
  ESTADO_COLORS, ESTADO_LABELS,
  PRIORIDAD_COLORS, PRIORIDAD_LABELS,
  formatDateTime,
} from "@/utils";
import { Ticket as TicketIcon, Search, Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ── KPI mini ──────────────────────────────────────────────────────────────────
function MiniKpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-4 py-3 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ── Ticket Card (mobile-friendly) ─────────────────────────────────────────────
function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <div
      className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-sm hover:border-blue-200 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-blue-600 font-semibold">{ticket.numero}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[ticket.estado]}`}>
              {ESTADO_LABELS[ticket.estado]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
              {PRIORIDAD_LABELS[ticket.prioridad]}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 truncate">{ticket.titulo}</p>
          <p className="text-xs text-slate-400 mt-0.5">{ticket.nombre_reportante}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span>📂 {ticket.tipo_servicio.nombre}</span>
        <span>📍 {ticket.area.nombre}</span>
        <span className="ml-auto">{formatDateTime(ticket.creado_en)}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MisTicketsPage() {
  const navigate  = useNavigate();
  const { data: tickets = [], isLoading } = useMisTickets();
  const [tab, setTab]         = useState<"todos" | "abierto" | "en_proceso" | "cerrado">("todos");
  const [busqueda, setBusqueda] = useState("");

  // KPIs
  const abiertos  = tickets.filter((t) => t.estado === "abierto").length;
  const enProceso = tickets.filter((t) => t.estado === "en_proceso").length;
  const cerrados  = tickets.filter((t) => t.estado === "cerrado").length;

  // Filtros
  const filtrados = tickets.filter((t) => {
    const matchTab = tab === "todos" || t.estado === tab;
    const q = busqueda.toLowerCase();
    const matchQ = !q ||
      t.numero.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      t.nombre_reportante.toLowerCase().includes(q) ||
      t.area.nombre.toLowerCase().includes(q);
    return matchTab && matchQ;
  });

  const tabs = [
    { key: "todos",      label: "Todos",      count: tickets.length },
    { key: "abierto",    label: "Abiertos",   count: abiertos },
    { key: "en_proceso", label: "En Proceso", count: enProceso },
    { key: "cerrado",    label: "Cerrados",   count: cerrados },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis Tickets</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tickets asignados a ti</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <MiniKpi label="Abiertos"   value={abiertos}  color="bg-blue-50 text-blue-700" />
        <MiniKpi label="En Proceso" value={enProceso} color="bg-yellow-50 text-yellow-700" />
        <MiniKpi label="Cerrados"   value={cerrados}  color="bg-green-50 text-green-700" />
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input
          placeholder="Buscar por número, título, reportante..."
          className="pl-9 text-sm"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              tab === key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <TicketIcon size={32} className="mb-2 opacity-40" />
          <p className="text-sm">
            {busqueda ? "No se encontraron tickets" : "No tienes tickets en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              onClick={() => navigate(`/mis-tickets/${t.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
