import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, AdminGuard, AgenteGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import TicketsPage from "@/pages/admin/TicketsPage";
import TicketDetailPage from "@/pages/admin/TicketDetailPage";

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
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route element={<AdminGuard />}>
              <Route path="/"                    element={<DashboardPage />} />
              <Route path="/tickets"             element={<TicketsPage />} />
              <Route path="/tickets/:id"         element={<TicketDetailPage />} />
              <Route path="/usuarios"            element={<Placeholder title="Usuarios" />} />
              <Route path="/catalogos/servicios" element={<Placeholder title="Tipos de Servicio" />} />
              <Route path="/catalogos/areas"     element={<Placeholder title="Áreas" />} />
              <Route path="/reportes"            element={<Placeholder title="Reportes" />} />
            </Route>
            <Route element={<AgenteGuard />}>
              <Route path="/mis-tickets"         element={<Placeholder title="Mis Tickets" />} />
              <Route path="/mis-tickets/:id"     element={<Placeholder title="Detalle Ticket" />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
