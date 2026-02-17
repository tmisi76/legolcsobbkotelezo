import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { HomeRoute } from "@/components/HomeRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardHome from "./pages/DashboardHome";
import DashboardCars from "./pages/DashboardCars";
import DashboardDocuments from "./pages/DashboardDocuments";
import DashboardSettings from "./pages/DashboardSettings";
import CarDetailsPage from "./pages/CarDetailsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminUsers from "./pages/AdminUsers";
import AdminEmailPreview from "./pages/AdminEmailPreview";
import AdminPages from "./pages/AdminPages";
import AdminEmailTemplates from "./pages/AdminEmailTemplates";
import AdminEmailLogs from "./pages/AdminEmailLogs";
import Adatvedelem from "./pages/Adatvedelem";
import ASZF from "./pages/ASZF";
import DynamicPage from "./pages/DynamicPage";
import EmailActionConfirmation from "./pages/EmailActionConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <HomeRoute>
                  <Index />
                </HomeRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cars"
              element={
                <ProtectedRoute>
                  <DashboardCars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cars/:id"
              element={
                <ProtectedRoute>
                  <CarDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/documents"
              element={
                <ProtectedRoute>
                  <DashboardDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <AdminProtectedRoute>
                  <AdminClients />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/email-preview"
              element={
                <AdminProtectedRoute>
                  <AdminEmailPreview />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/pages"
              element={
                <AdminProtectedRoute>
                  <AdminPages />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/email-templates"
              element={
                <AdminProtectedRoute>
                  <AdminEmailTemplates />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/email-logs"
              element={
                <AdminProtectedRoute>
                  <AdminEmailLogs />
                </AdminProtectedRoute>
              }
            />
            {/* Legal pages */}
            <Route path="/adatvedelem" element={<Adatvedelem />} />
            <Route path="/aszf" element={<ASZF />} />
            <Route path="/kapcsolat" element={<DynamicPage />} />
            <Route path="/impresszum" element={<DynamicPage />} />
            <Route path="/munkatarsaink" element={<DynamicPage />} />
            <Route path="/oldal/:slug" element={<DynamicPage />} />
            <Route path="/email-action-confirm" element={<EmailActionConfirmation />} />
            {/* Dynamic pages by slug - must be before catch-all */}
            <Route path="/:slug" element={<DynamicPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
