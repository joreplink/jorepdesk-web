import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, AdminGuard, AgenteGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";

// Páginas — se irán creando en los siguientes pasos
// Por ahora usamos placeholders
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      <p className="text-slate-400 text-sm mt-1">Página en construcción</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas — requieren autenticación */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>

            {/* Admin */}
            <Route element={<AdminGuard />}>
              <Route path="/"                     element={<Placeholder title="Dashboard" />} />
              <Route path="/tickets"              element={<Placeholder title="Tickets" />} />
              <Route path="/tickets/:id"          element={<Placeholder title="Detalle Ticket" />} />
              <Route path="/usuarios"             element={<Placeholder title="Usuarios" />} />
              <Route path="/catalogos/servicios"  element={<Placeholder title="Tipos de Servicio" />} />
              <Route path="/catalogos/areas"      element={<Placeholder title="Áreas" />} />
              <Route path="/reportes"             element={<Placeholder title="Reportes" />} />
            </Route>

            {/* Agente */}
            <Route element={<AgenteGuard />}>
              <Route path="/mis-tickets"          element={<Placeholder title="Mis Tickets" />} />
              <Route path="/mis-tickets/:id"      element={<Placeholder title="Detalle Ticket" />} />
            </Route>

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
