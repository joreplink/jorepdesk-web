// ── Enums ─────────────────────────────────────────────────────────────────────
export type RolUsuario = "admin" | "agente";
export type EstadoTicket = "abierto" | "en_proceso" | "cerrado";
export type PrioridadTicket = "baja" | "media" | "alta" | "critica";
export type TipoReporte = "por_tipo_servicio" | "por_area" | "por_agente";

// ── Usuario ───────────────────────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  cargo?: string;
  telefono?: string;
  activo: boolean;
  creado_en: string;
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  cargo?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolUsuario;
  cargo?: string;
  telefono?: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  cargo?: string;
  telefono?: string;
  activo?: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: Usuario;
}

// ── Catálogos ─────────────────────────────────────────────────────────────────
export interface TipoServicio {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creado_en: string;
}

export interface TipoServicioCreate {
  nombre: string;
  descripcion?: string;
}

export interface Area {
  id: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  activo: boolean;
  creado_en: string;
}

export interface AreaCreate {
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export interface AgenteSummary {
  id: string;
  nombre: string;
  apellido: string;
  cargo?: string;
}

export interface HistorialEstado {
  id: string;
  estado_anterior: EstadoTicket;
  estado_nuevo: EstadoTicket;
  cambiado_en: string;
  cambiado_por: UsuarioResumen;
}

export interface Ticket {
  id: string;
  numero: string;
  titulo: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  nombre_reportante: string;
  telefono_reportante?: string;
  tipo_servicio: TipoServicio;
  area: Area;
  creado_por: UsuarioResumen;
  creado_en: string;
  actualizado_en: string;
  cerrado_en?: string;
  agentes: AgenteSummary[];
}

export interface TicketDetail extends Ticket {
  historial_estados: HistorialEstado[];
}

export interface TicketCreate {
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  nombre_reportante: string;
  telefono_reportante?: string;
  tipo_servicio_id: string;
  area_id: string;
}

// ── Observaciones ─────────────────────────────────────────────────────────────
export interface Observacion {
  id: string;
  contenido: string;
  creado_en: string;
  agente: UsuarioResumen;
}

// ── Evidencias ────────────────────────────────────────────────────────────────
export interface Evidencia {
  id: string;
  nombre_archivo: string;
  tipo_archivo: string;
  ruta: string;
  tamano_bytes: number;
  subido_en: string;
  subido_por: UsuarioResumen;
}

// ── Reportes ──────────────────────────────────────────────────────────────────
export interface TicketResumenMetrica {
  nombre: string;
  total: number;
  abiertos: number;
  en_proceso: number;
  cerrados: number;
  promedio_horas_cierre?: number;
}

export interface Reporte {
  id: string;
  tipo: TipoReporte;
  filtro_id?: string;
  fecha_inicio: string;
  fecha_fin: string;
  generado_en: string;
  generado_por: UsuarioResumen;
  metricas: TicketResumenMetrica[];
  total_tickets: number;
}

export interface ReporteParams {
  tipo: TipoReporte;
  filtro_id?: string;
  fecha_inicio: string;
  fecha_fin: string;
}
