import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useTicket, useCambiarEstado,
  useObservaciones, useAddObservacion,
  useEvidencias, useSubirEvidencia,
} from "@/hooks/useTickets";
import { useAuthStore } from "@/store/authStore";
import {
  ESTADO_COLORS, ESTADO_LABELS,
  PRIORIDAD_COLORS, PRIORIDAD_LABELS,
  formatDateTime, formatBytes,
} from "@/utils";
import {
  ArrowLeft, Loader2, MessageSquare,
  Paperclip, Upload, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

// Transiciones permitidas por estado
const SIGUIENTE_ESTADO: Record<string, { estado: string; label: string; color: string } | null> = {
  abierto:    { estado: "en_proceso", label: "Tomar Ticket",    color: "bg-yellow-500 hover:bg-yellow-600" },
  en_proceso: { estado: "cerrado",    label: "Cerrar Ticket",   color: "bg-green-600 hover:bg-green-700" },
  cerrado:    null,
};

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
              {add.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    subir.mutate(file, {
      onSuccess: () => toast.success("Evidencia subida correctamente"),
      onError: (err: any) => toast.error(err?.response?.data?.detail ?? "Error al subir archivo"),
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
                {formatBytes(ev.tamano_bytes)} · {formatDateTime(ev.subido_en)}
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
          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-colors mt-1">
            <Upload size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">
              {subir.isPending ? "Subiendo..." : "Seleccionar archivo (JPG, PNG, PDF — máx 10 MB)"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFile}
              disabled={subir.isPending}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MiTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: ticket, isLoading } = useTicket(id!);
  const cambiarEstado = useCambiarEstado(id!);
  const [confirmModal, setConfirmModal] = useState<{ estado: string; label: string } | null>(null);

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
  const siguiente = SIGUIENTE_ESTADO[ticket.estado];

  const handleCambiarEstado = () => {
    if (!confirmModal) return;
    cambiarEstado.mutate(confirmModal.estado, {
      onSuccess: () => {
        toast.success(`Ticket actualizado a "${ESTADO_LABELS[confirmModal.estado as keyof typeof ESTADO_LABELS]}"`);
        setConfirmModal(null);
      },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-blue-600 font-semibold text-sm">{ticket.numero}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLORS[ticket.estado]}`}>
              {ESTADO_LABELS[ticket.estado]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
              {PRIORIDAD_LABELS[ticket.prioridad]}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{ticket.titulo}</h1>
        </div>
      </div>

      {/* Acción principal — cambio de estado */}
      {siguiente && !cerrado && (
        <div className={`rounded-lg p-4 text-white ${siguiente.color.split(" ")[0]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{siguiente.label}</p>
              <p className="text-xs opacity-80 mt-0.5">
                Cambia el estado a "{ESTADO_LABELS[siguiente.estado as keyof typeof ESTADO_LABELS]}"
              </p>
            </div>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setConfirmModal(siguiente)}
            >
              Confirmar <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {cerrado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-semibold text-sm">✓ Ticket cerrado</p>
          <p className="text-green-500 text-xs mt-0.5">Este ticket ha sido resuelto</p>
        </div>
      )}

      {/* Info del ticket */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Información</CardTitle>
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
                <p className="text-slate-500 text-xs">{ticket.telefono_reportante}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Área</p>
              <p className="font-medium text-slate-700">{ticket.area.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tipo de Servicio</p>
              <p className="font-medium text-slate-700">{ticket.tipo_servicio.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fecha creación</p>
              <p className="text-slate-600 text-xs">{formatDateTime(ticket.creado_en)}</p>
            </div>
          </div>

          {/* Historial de estados */}
          {ticket.historial_estados.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Historial de Estados</p>
                <div className="space-y-2">
                  {ticket.historial_estados.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[h.estado_anterior]}`}>
                        {ESTADO_LABELS[h.estado_anterior]}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[h.estado_nuevo]}`}>
                        {ESTADO_LABELS[h.estado_nuevo]}
                      </span>
                      <span className="text-slate-400 ml-auto">{formatDateTime(h.cambiado_en)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Observaciones */}
      <SeccionObservaciones ticketId={ticket.id} cerrado={cerrado} />

      {/* Evidencias */}
      <SeccionEvidencias ticketId={ticket.id} cerrado={cerrado} />

      {/* Modal confirmación cambio de estado */}
      <Dialog open={!!confirmModal} onOpenChange={(v) => { if (!v) setConfirmModal(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar acción</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            ¿Estás seguro de que quieres{" "}
            <strong>{confirmModal?.label.toLowerCase()}</strong>?
            {confirmModal?.estado === "cerrado" && (
              <span className="block mt-1 text-orange-600 text-xs">
                ⚠️ Una vez cerrado no podrás cambiar el estado nuevamente.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(null)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} disabled={cambiarEstado.isPending}>
              {cambiarEstado.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
