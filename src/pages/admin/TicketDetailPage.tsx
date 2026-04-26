import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useAsignarTicket, useReasignarTicket, useObservaciones, useAddObservacion, useEvidencias, useSubirEvidencia } from "@/hooks/useTickets";
import { useAgentes } from "@/hooks/useUsuarios";
import { useAuthStore } from "@/store/authStore";
import type { TicketDetail, AgenteSummary } from "@/types";
import { ESTADO_COLORS, ESTADO_LABELS, PRIORIDAD_COLORS, PRIORIDAD_LABELS, formatDateTime, formatBytes } from "@/utils";
import {
  ArrowLeft, Users, MessageSquare, Paperclip,
  Upload, Loader2, CheckCircle, Clock, AlertCircle, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ── Modal Asignar / Reasignar ─────────────────────────────────────────────────
function ModalAsignar({
  open, onClose, ticketId, modo, agentesActuales,
}: {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  modo: "asignar" | "reasignar";
  agentesActuales: AgenteSummary[];
}) {
  const { data: agentes = [] } = useAgentes(true);
  const asignar   = useAsignarTicket(ticketId);
  const reasignar = useReasignarTicket(ticketId);
  const [seleccionados, setSeleccionados] = useState<string[]>(
    modo === "reasignar" ? agentesActuales.map((a) => a.id) : []
  );

  const toggle = (id: string) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = () => {
    if (seleccionados.length === 0) {
      toast.error("Selecciona al menos un agente");
      return;
    }
    const fn = modo === "asignar" ? asignar : reasignar;
    fn.mutate(seleccionados, {
      onSuccess: () => {
        toast.success(modo === "asignar" ? "Agentes asignados" : "Ticket reasignado");
        onClose();
      },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  const isPending = asignar.isPending || reasignar.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{modo === "asignar" ? "Asignar Agentes" : "Reasignar Ticket"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-72 overflow-y-auto py-2">
          {agentes.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(a.id)}
                onChange={() => toggle(a.id)}
                className="rounded"
              />
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {a.nombre[0]}{a.apellido[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{a.nombre} {a.apellido}</p>
                <p className="text-xs text-slate-400">{a.cargo ?? a.email}</p>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {modo === "asignar" ? "Asignar" : "Reasignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sección Observaciones ─────────────────────────────────────────────────────
function SeccionObservaciones({ ticketId, cerrado }: { ticketId: string; cerrado: boolean }) {
  const { data: obs = [], isLoading } = useObservaciones(ticketId);
  const add = useAddObservacion(ticketId);
  const [texto, setTexto] = useState("");

  const handleAdd = () => {
    if (!texto.trim()) return;
    add.mutate(texto, {
      onSuccess: () => { toast.success("Observación agregada"); setTexto(""); },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MessageSquare size={15} /> Observaciones ({obs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-xs text-slate-400">Cargando...</p>}
        {obs.length === 0 && !isLoading && (
          <p className="text-xs text-slate-400 text-center py-2">Sin observaciones aún</p>
        )}
        {obs.map((o) => (
          <div key={o.id} className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {o.agente.nombre[0]}
              </div>
              <span className="text-xs font-medium text-slate-700">
                {o.agente.nombre} {o.agente.apellido}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{formatDateTime(o.creado_en)}</span>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{o.contenido}</p>
          </div>
        ))}

        {!cerrado && (
          <div className="space-y-2 pt-1">
            <Textarea
              placeholder="Escribe una observación..."
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <Button size="sm" onClick={handleAdd} disabled={add.isPending || !texto.trim()}>
              {add.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Agregar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Sección Evidencias ────────────────────────────────────────────────────────
function SeccionEvidencias({ ticketId, cerrado }: { ticketId: string; cerrado: boolean }) {
  const { data: evidencias = [], isLoading } = useEvidencias(ticketId);
  const subir = useSubirEvidencia(ticketId);
  const [progreso, setProgreso] = useState<number | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgreso(0);
    subir.mutate(file, {
      onSuccess: () => { toast.success("Evidencia subida"); setProgreso(null); },
      onError: (err: any) => {
        toast.error(err?.response?.data?.detail ?? "Error al subir archivo");
        setProgreso(null);
      },
    });
  };

  const tipoIcono = (mime: string) => {
    if (mime.startsWith("image/")) return "🖼️";
    if (mime === "application/pdf") return "📄";
    return "📎";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Paperclip size={15} /> Evidencias ({evidencias.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-xs text-slate-400">Cargando...</p>}
        {evidencias.length === 0 && !isLoading && (
          <p className="text-xs text-slate-400 text-center py-2">Sin evidencias aún</p>
        )}
        {evidencias.map((ev) => (
          <div key={ev.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            <span className="text-lg">{tipoIcono(ev.tipo_archivo)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate font-medium">{ev.nombre_archivo}</p>
              <p className="text-xs text-slate-400">
                {formatBytes(ev.tamano_bytes)} · {ev.subido_por.nombre} {ev.subido_por.apellido} · {formatDateTime(ev.subido_en)}
              </p>
            </div>
            <a
              href={`http://localhost:8000/media/${ev.ruta}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex-shrink-0"
            >
              Ver
            </a>
          </div>
        ))}

        {!cerrado && (
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-colors">
              <Upload size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                {subir.isPending ? `Subiendo...${progreso !== null ? ` ${progreso}%` : ""}` : "Seleccionar archivo (JPG, PNG, PDF — máx 10 MB)"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                onChange={handleFile}
                disabled={subir.isPending}
              />
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === "admin";

  const { data: ticket, isLoading } = useTicket(id!);
  const [modalAsignar, setModalAsignar] = useState<"asignar" | "reasignar" | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Ticket no encontrado</p>
        <Button variant="link" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const cerrado = ticket.estado === "cerrado";
  const tieneAgentes = ticket.agentes.length > 0;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-blue-600 font-semibold">{ticket.numero}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLORS[ticket.estado]}`}>
              {ESTADO_LABELS[ticket.estado]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
              {PRIORIDAD_LABELS[ticket.prioridad]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-0.5">{ticket.titulo}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna izquierda — info principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info del ticket */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Descripción</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.descripcion ?? "—"}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Reportante</p>
                  <p className="font-medium text-slate-700">{ticket.nombre_reportante}</p>
                  {ticket.telefono_reportante && (
                    <p className="text-slate-500">{ticket.telefono_reportante}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tipo de Servicio</p>
                  <p className="font-medium text-slate-700">{ticket.tipo_servicio.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Área</p>
                  <p className="font-medium text-slate-700">{ticket.area.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Creado por</p>
                  <p className="font-medium text-slate-700">
                    {ticket.creado_por.nombre} {ticket.creado_por.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fecha creación</p>
                  <p className="text-slate-600">{formatDateTime(ticket.creado_en)}</p>
                </div>
                {ticket.cerrado_en && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fecha cierre</p>
                    <p className="text-slate-600">{formatDateTime(ticket.cerrado_en)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historial de estados */}
          {ticket.historial_estados.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock size={15} /> Historial de Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.historial_estados.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[h.estado_anterior]}`}>
                          {ESTADO_LABELS[h.estado_anterior]}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[h.estado_nuevo]}`}>
                          {ESTADO_LABELS[h.estado_nuevo]}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs ml-auto">
                        {h.cambiado_por.nombre} · {formatDateTime(h.cambiado_en)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          <SeccionObservaciones ticketId={ticket.id} cerrado={cerrado} />

          {/* Evidencias */}
          <SeccionEvidencias ticketId={ticket.id} cerrado={cerrado} />
        </div>

        {/* Columna derecha — acciones */}
        <div className="space-y-4">

          {/* Agentes asignados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <UserCheck size={15} /> Agentes Asignados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ticket.agentes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Sin agentes asignados</p>
              ) : (
                ticket.agentes.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {a.nombre[0]}{a.apellido[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{a.nombre} {a.apellido}</p>
                      {a.cargo && <p className="text-xs text-slate-400">{a.cargo}</p>}
                    </div>
                  </div>
                ))
              )}

              {/* Botones asignar / reasignar — solo admin, solo si no cerrado */}
              {isAdmin && !cerrado && (
                <div className="pt-2 space-y-2">
                  {!tieneAgentes ? (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setModalAsignar("asignar")}
                    >
                      <Users size={14} className="mr-2" /> Asignar Agentes
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setModalAsignar("reasignar")}
                    >
                      <Users size={14} className="mr-2" /> Reasignar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado del ticket */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Estado del Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(["abierto", "en_proceso", "cerrado"] as const).map((estado) => (
                  <div
                    key={estado}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      ticket.estado === estado
                        ? "bg-blue-50 border border-blue-200"
                        : "text-slate-400"
                    }`}
                  >
                    {ticket.estado === estado ? (
                      <CheckCircle size={14} className="text-blue-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />
                    )}
                    <span className={ticket.estado === estado ? "font-medium text-blue-700" : ""}>
                      {ESTADO_LABELS[estado]}
                    </span>
                  </div>
                ))}
              </div>

              {cerrado && (
                <p className="text-xs text-green-600 text-center mt-3 bg-green-50 rounded-lg py-2">
                  ✓ Ticket cerrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal asignar/reasignar */}
      {modalAsignar && (
        <ModalAsignar
          open={!!modalAsignar}
          onClose={() => setModalAsignar(null)}
          ticketId={ticket.id}
          modo={modalAsignar}
          agentesActuales={ticket.agentes}
        />
      )}
    </div>
  );
}
