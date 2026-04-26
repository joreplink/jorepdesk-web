import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTickets, useCrearTicket } from "@/hooks/useTickets";
import { useTipoServicios, useAreas } from "@/hooks/useCatalogos";
import type { Ticket, TicketCreate, EstadoTicket, PrioridadTicket } from "@/types";
import {
  ESTADO_COLORS, ESTADO_LABELS,
  PRIORIDAD_COLORS, PRIORIDAD_LABELS,
  formatDateTime,
} from "@/utils";
import { Plus, Search, Filter, Loader2, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ── Schema crear ticket ───────────────────────────────────────────────────────
const schema = z.object({
  titulo:              z.string().min(1, "El título es requerido").max(200),
  descripcion:         z.string().min(1, "La descripción es requerida"),
  prioridad:           z.enum(["baja", "media", "alta", "critica"]),
  nombre_reportante:   z.string().min(1, "El nombre del reportante es requerido"),
  telefono_reportante: z.string().optional(),
  tipo_servicio_id:    z.string().min(1, "Selecciona un tipo de servicio"),
  area_id:             z.string().min(1, "Selecciona un área"),
});

type FormData = z.infer<typeof schema>;

// ── Modal Crear Ticket ────────────────────────────────────────────────────────
function ModalCrearTicket({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: tipoServicios = [] } = useTipoServicios(true);
  const { data: areas = [] } = useAreas(true);
  const crear = useCrearTicket();

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { prioridad: "media" } });

  const onSubmit = (data: FormData) => {
    crear.mutate(data as TicketCreate, {
      onSuccess: () => {
        toast.success("Ticket creado correctamente");
        reset();
        onClose();
      },
      onError: (e: any) => {
        toast.error(e?.response?.data?.detail ?? "Error al crear el ticket");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input placeholder="Ej: Computadora no enciende" {...register("titulo")} />
            {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo.message}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label>Descripción *</Label>
            <Textarea
              placeholder="Describe el problema con detalle..."
              rows={3}
              {...register("descripcion")}
            />
            {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion.message}</p>}
          </div>

          {/* Prioridad + Tipo servicio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioridad *</Label>
              <Select defaultValue="media" onValueChange={(v) => setValue("prioridad", v as PrioridadTicket)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de Servicio *</Label>
              <Select onValueChange={(v) => setValue("tipo_servicio_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  {tipoServicios.map((ts) => (
                    <SelectItem key={ts.id} value={ts.id}>{ts.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_servicio_id && <p className="text-red-500 text-xs">{errors.tipo_servicio_id.message}</p>}
            </div>
          </div>

          {/* Área */}
          <div className="space-y-1.5">
            <Label>Área *</Label>
            <Select onValueChange={(v) => setValue("area_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona un área..." /></SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area_id && <p className="text-red-500 text-xs">{errors.area_id.message}</p>}
          </div>

          {/* Reportante */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre Reportante *</Label>
              <Input placeholder="Nombre completo" {...register("nombre_reportante")} />
              {errors.nombre_reportante && <p className="text-red-500 text-xs">{errors.nombre_reportante.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input placeholder="555-1234" {...register("telefono_reportante")} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : "Crear Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Ticket Row ────────────────────────────────────────────────────────────────
function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  return (
    <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={onClick}>
      <td className="px-4 py-3 text-sm font-mono text-blue-600 font-medium">{ticket.numero}</td>
      <td className="px-4 py-3 text-sm text-slate-800 max-w-xs">
        <p className="truncate">{ticket.titulo}</p>
        <p className="text-xs text-slate-400 truncate">{ticket.nombre_reportante}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLORS[ticket.estado]}`}>
          {ESTADO_LABELS[ticket.estado]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORIDAD_COLORS[ticket.prioridad]}`}>
          {PRIORIDAD_LABELS[ticket.prioridad]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">{ticket.tipo_servicio.nombre}</td>
      <td className="px-4 py-3 text-xs text-slate-500">{ticket.area.nombre}</td>
      <td className="px-4 py-3">
        <div className="flex -space-x-1">
          {ticket.agentes.slice(0, 3).map((a) => (
            <div
              key={a.id}
              title={`${a.nombre} ${a.apellido}`}
              className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
            >
              {a.nombre[0]}{a.apellido[0]}
            </div>
          ))}
          {ticket.agentes.length === 0 && (
            <span className="text-xs text-slate-400">Sin asignar</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(ticket.creado_en)}</td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");

  const { data: tickets = [], isLoading } = useTickets({
    estado:    filtroEstado    || undefined,
    prioridad: filtroPrioridad || undefined,
  });

  // Filtro de búsqueda local
  const filtrados = tickets.filter((t) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      t.numero.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      t.nombre_reportante.toLowerCase().includes(q) ||
      t.area.nombre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tickets</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtrados.length} ticket{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input
                placeholder="Buscar por número, título, reportante..."
                className="pl-9 text-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Estado */}
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            {/* Prioridad */}
            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>

            {/* Limpiar */}
            {(filtroEstado || filtroPrioridad || busqueda) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setFiltroEstado(""); setFiltroPrioridad(""); setBusqueda(""); }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <TicketIcon size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No se encontraron tickets</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["N°", "Ticket", "Estado", "Prioridad", "Tipo Servicio", "Área", "Agentes", "Creado"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map((t) => (
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

      <ModalCrearTicket open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
