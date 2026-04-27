import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsuarios, useCrearUsuario, useUpdateUsuario, useDesactivarUsuario } from "@/hooks/useUsuarios";
import type { Usuario } from "@/types";
import { Plus, Pencil, Trash2, Loader2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/utils";

// ── Schemas ───────────────────────────────────────────────────────────────────
const crearSchema = z.object({
  nombre:    z.string().min(1, "Requerido"),
  apellido:  z.string().min(1, "Requerido"),
  email:     z.string().email("Email inválido"),
  password:  z.string().min(8, "Mínimo 8 caracteres"),
  rol:       z.enum(["admin", "agente"]),
  cargo:     z.string().optional(),
  telefono:  z.string().optional(),
});

const editarSchema = z.object({
  nombre:   z.string().min(1, "Requerido"),
  apellido: z.string().min(1, "Requerido"),
  cargo:    z.string().optional(),
  telefono: z.string().optional(),
  activo:   z.boolean(),
});

type CrearForm = z.infer<typeof crearSchema>;
type EditarForm = z.infer<typeof editarSchema>;

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ usuario }: { usuario: Usuario }) {
  const colors: Record<string, string> = {
    admin:  "bg-blue-500",
    agente: "bg-purple-500",
  };
  return (
    <div className={`w-8 h-8 rounded-full ${colors[usuario.rol]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {usuario.nombre[0]}{usuario.apellido[0]}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UsuariosPage() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const crear      = useCrearUsuario();
  const update     = useUpdateUsuario();
  const desactivar = useDesactivarUsuario();

  const [modalCrear, setModalCrear]   = useState(false);
  const [editando, setEditando]       = useState<Usuario | null>(null);
  const [filtroRol, setFiltroRol]     = useState("");
  const [busqueda, setBusqueda]       = useState("");

  // Forms
  const crearForm = useForm<CrearForm>({ resolver: zodResolver(crearSchema) });
  const editarForm = useForm<EditarForm>({ resolver: zodResolver(editarSchema) });

  // Filtros locales
  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q ||
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cargo ?? "").toLowerCase().includes(q);
    const matchRol = !filtroRol || u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    editarForm.setValue("nombre",   u.nombre);
    editarForm.setValue("apellido", u.apellido);
    editarForm.setValue("cargo",    u.cargo ?? "");
    editarForm.setValue("telefono", u.telefono ?? "");
    editarForm.setValue("activo",   u.activo);
  };

  const onCrear = (data: CrearForm) => {
    crear.mutate(data, {
      onSuccess: () => { toast.success("Usuario creado"); setModalCrear(false); crearForm.reset(); },
      onError:   (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  const onEditar = (data: EditarForm) => {
    if (!editando) return;
    update.mutate({ id: editando.id, data }, {
      onSuccess: () => { toast.success("Usuario actualizado"); setEditando(null); },
      onError:   (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  const handleDesactivar = (u: Usuario) => {
    if (!confirm(`¿Desactivar a ${u.nombre} ${u.apellido}?`)) return;
    desactivar.mutate(u.id, {
      onSuccess: () => toast.success("Usuario desactivado"),
      onError:   (e: any) => toast.error(e?.response?.data?.detail ?? "Error"),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtrados.length} usuario{filtrados.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setModalCrear(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input
                placeholder="Buscar por nombre, email, cargo..."
                className="pl-9 text-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="agente">Agente</SelectItem>
              </SelectContent>
            </Select>
            {(busqueda || filtroRol) && (
              <Button variant="outline" size="sm" onClick={() => { setBusqueda(""); setFiltroRol(""); }}>
                Limpiar
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
              <Users size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Usuario", "Email", "Rol", "Cargo", "Estado", "Creado", "Acciones"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar usuario={u} />
                          <span className="text-sm font-medium text-slate-800">
                            {u.nombre} {u.apellido}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.rol === "admin" ? "default" : "secondary"}>
                          {u.rol === "admin" ? "Admin" : "Agente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{u.cargo ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.activo ? "default" : "secondary"}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.creado_en)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => abrirEditar(u)}>
                            <Pencil size={14} />
                          </Button>
                          {u.activo && (
                            <Button
                              size="sm" variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDesactivar(u)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear */}
      <Dialog open={modalCrear} onOpenChange={(v) => { if (!v) setModalCrear(false); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={crearForm.handleSubmit(onCrear)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input {...crearForm.register("nombre")} />
                {crearForm.formState.errors.nombre && (
                  <p className="text-red-500 text-xs">{crearForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Apellido *</Label>
                <Input {...crearForm.register("apellido")} />
                {crearForm.formState.errors.apellido && (
                  <p className="text-red-500 text-xs">{crearForm.formState.errors.apellido.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" {...crearForm.register("email")} />
              {crearForm.formState.errors.email && (
                <p className="text-red-500 text-xs">{crearForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña *</Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" {...crearForm.register("password")} />
              {crearForm.formState.errors.password && (
                <p className="text-red-500 text-xs">{crearForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Rol *</Label>
                <Select onValueChange={(v) => crearForm.setValue("rol", v as "admin" | "agente")}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                  </SelectContent>
                </Select>
                {crearForm.formState.errors.rol && (
                  <p className="text-red-500 text-xs">{crearForm.formState.errors.rol.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input {...crearForm.register("telefono")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input placeholder="Ej: Técnico de Soporte" {...crearForm.register("cargo")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalCrear(false)}>Cancelar</Button>
              <Button type="submit" disabled={crear.isPending}>
                {crear.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={!!editando} onOpenChange={(v) => { if (!v) setEditando(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={editarForm.handleSubmit(onEditar)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input {...editarForm.register("nombre")} />
                {editarForm.formState.errors.nombre && (
                  <p className="text-red-500 text-xs">{editarForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Apellido *</Label>
                <Input {...editarForm.register("apellido")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input {...editarForm.register("cargo")} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input {...editarForm.register("telefono")} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                {...editarForm.register("activo")}
                className="rounded"
              />
              <Label htmlFor="activo">Usuario activo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
