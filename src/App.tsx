import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, AdminGuard, AgenteGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import TicketsPage from "@/pages/admin/TicketsPage";
import TicketDetailPage from "@/pages/admin/TicketDetailPage";
import { TipoServicioPage, AreasPage } from "@/pages/admin/CatalogosPage";
import UsuariosPage from "@/pages/admin/UsuariosPage";
import ReportesPage from "@/pages/admin/ReportesPage";
import MisTicketsPage from "@/pages/agente/MisTicketsPage";
import MiTicketDetailPage from "@/pages/agente/MiTicketDetailPage";

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
              <Route path="/usuarios"            element={<UsuariosPage />} />
              <Route path="/catalogos/servicios" element={<TipoServicioPage />} />
              <Route path="/catalogos/areas"     element={<AreasPage />} />
              <Route path="/reportes"            element={<ReportesPage />} />
            </Route>
            <Route element={<AgenteGuard />}>
              <Route path="/mis-tickets"         element={<MisTicketsPage />} />
              <Route path="/mis-tickets/:id"     element={<MiTicketDetailPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
