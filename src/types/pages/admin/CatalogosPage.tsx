import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTipoServicios, useCrearTipoServicio, useUpdateTipoServicio, useDeleteTipoServicio,
  useAreas, useCrearArea, useUpdateArea, useDeleteArea,
} from "@/hooks/useCatalogos";
import { TipoServicio, Area } from "@/types";
import { Plus, Pencil, Trash2, Loader2, FolderOpen, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Schemas ───────────────────────────────────────────────────────────────────
const tipoServicioSchema = z.object({
  nombre:      z.string().min(1, "El nombre es requerido").max(100),
  descripcion: z.string().optional(),
});

const areaSchema = z.object({
  nombre:      z.string().min(1, "El nombre es requerido").max(100),
  descripcion: z.string().optional(),
  ubicacion:   z.string().optional(),
});

type TipoServicioForm = z.infer<typeof tipoServicioSchema>;
type AreaForm = z.infer<typeof areaSchema>;

// ══════════════════════════════════════════════════════════════════════════════
//  TIPO SERVICIO PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function TipoServicioPage() {
  const { data: tipos = [], isLoading } = useTipoServicios();
  const crear   = useCrearTipoServicio();
  const update  = useUpdateTipoServicio();
  const eliminar = useDeleteTipoServicio();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<TipoServicio | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<TipoServicioForm>({ resolver: zodResolver(tipoServicioSchema) });

  const abrirCrear = () => { reset(); setEditando(null); setModalOpen(true); };
  const abrirEditar = (tipo: TipoServicio) => {
    setEditando(tipo);
    setValue("nombre", tipo.nombre);
    setValue("descripcion", tipo.descripcion ?? "");
    setModalOpen(true);
  };

  const onSubmit = (data: TipoServicioForm) => {
    if (editando) {
      update.mutate({ id: editando.id, data }, {
        onSuccess: () => { toast.success("Tipo de servicio actualizado"); setModalOpen(false); },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
      });
    } else {
      crear.mutate(data, {
        onSuccess: () => { toast.success("Tipo de servicio creado"); setModalOpen(false); reset(); },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
      });
    }
  };

  const handleEliminar = (tipo: TipoServicio) => {
    if (!confirm(`¿Desactivar "${tipo.nombre}"?`)) return;
    eliminar.mutate(tipo.id, {
      onSuccess: () => toast.success("Tipo de servicio desactivado"),
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  const isPending = crear.isPending || update.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tipos de Servicio</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tipos.length} registros</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : tipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <FolderOpen size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No hay tipos de servicio registrados</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Nombre", "Descripción", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tipos.map((tipo) => (
                  <tr key={tipo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{tipo.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                      {tipo.descripcion || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tipo.activo ? "default" : "secondary"}>
                        {tipo.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => abrirEditar(tipo)}>
                          <Pencil size={14} />
                        </Button>
                        {tipo.activo && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleEliminar(tipo)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Tipo de Servicio" : "Nuevo Tipo de Servicio"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Soporte de Hardware" {...register("nombre")} />
              {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea placeholder="Descripción opcional..." rows={3} {...register("descripcion")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editando ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  AREAS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function AreasPage() {
  const { data: areas = [], isLoading } = useAreas();
  const crear    = useCrearArea();
  const update   = useUpdateArea();
  const eliminar = useDeleteArea();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Area | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<AreaForm>({ resolver: zodResolver(areaSchema) });

  const abrirCrear = () => { reset(); setEditando(null); setModalOpen(true); };
  const abrirEditar = (area: Area) => {
    setEditando(area);
    setValue("nombre", area.nombre);
    setValue("descripcion", area.descripcion ?? "");
    setValue("ubicacion", area.ubicacion ?? "");
    setModalOpen(true);
  };

  const onSubmit = (data: AreaForm) => {
    if (editando) {
      update.mutate({ id: editando.id, data }, {
        onSuccess: () => { toast.success("Área actualizada"); setModalOpen(false); },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
      });
    } else {
      crear.mutate(data, {
        onSuccess: () => { toast.success("Área creada"); setModalOpen(false); reset(); },
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
      });
    }
  };

  const handleEliminar = (area: Area) => {
    if (!confirm(`¿Desactivar "${area.nombre}"?`)) return;
    eliminar.mutate(area.id, {
      onSuccess: () => toast.success("Área desactivada"),
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  const isPending = crear.isPending || update.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Áreas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{areas.length} registros</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Área
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <MapPin size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No hay áreas registradas</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Nombre", "Descripción", "Ubicación", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{area.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                      {area.descripcion || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{area.ubicacion || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={area.activo ? "default" : "secondary"}>
                        {area.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => abrirEditar(area)}>
                          <Pencil size={14} />
                        </Button>
                        {area.activo && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleEliminar(area)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Área" : "Nueva Área"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Recursos Humanos" {...register("nombre")} />
              {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea placeholder="Descripción opcional..." rows={2} {...register("descripcion")} />
            </div>
            <div className="space-y-1.5">
              <Label>Ubicación</Label>
              <Input placeholder="Ej: Edificio A, Piso 3" {...register("ubicacion")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editando ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
