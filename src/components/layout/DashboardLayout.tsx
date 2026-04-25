import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Ticket, Users, FolderOpen,
  MapPin, BarChart2, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { cn } from "@/utils";

const adminNav = [
  { to: "/",                  label: "Dashboard",       icon: LayoutDashboard },
  { to: "/tickets",           label: "Tickets",         icon: Ticket },
  { to: "/usuarios",          label: "Agentes",         icon: Users },
  { to: "/catalogos/servicios", label: "Tipo Servicio", icon: FolderOpen },
  { to: "/catalogos/areas",   label: "Áreas",           icon: MapPin },
  { to: "/reportes",          label: "Reportes",        icon: BarChart2 },
];

const agenteNav = [
  { to: "/mis-tickets", label: "Mis Tickets", icon: Ticket },
];

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const nav = user?.rol === "admin" ? adminNav : agenteNav;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg tracking-tight">
          Help<span className="text-blue-400">Desk</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">{user?.rol === "admin" ? "Administrador" : "Agente"}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-56 flex-shrink-0 bg-slate-800 flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-slate-800 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setOpen(true)} className="text-slate-600">
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-slate-800">
            Help<span className="text-blue-600">Desk</span>
          </h1>
          <div className="w-5" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
