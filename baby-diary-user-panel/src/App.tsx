import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, GamificationProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/admin/AdminAuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Memories from "./pages/Memories";
import Milestones from "./pages/Milestones";
import Activities from "./pages/Activities";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Health from './pages/Health';
import Rewards from './pages/Rewards';
import Growth from './pages/Growth';
import Business from "./pages/Business";
import AcceptFamilyInvite from './pages/AcceptFamilyInvite';
import MeusPedidos from './pages/MeusPedidos';

// Admin pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminPlans } from "./pages/admin/AdminPlans";
import { AdminGamification } from "./pages/admin/AdminGamification";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminMilestones } from "./pages/admin/AdminMilestones";
import { AdminMarketing } from "./pages/admin/AdminMarketing";
import { AdminPedidos } from "./pages/admin/AdminPedidos";
import LojaRoutes from './pages/loja';
import AdminLoja from './pages/admin/loja';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GamificationProvider>
            <AdminAuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Rotas públicas */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/business" element={<Business />} />
                    <Route path="/accept-family-invite" element={<AcceptFamilyInvite />} />

                    {/* Rotas protegidas do usuário */}
                    <Route path="/onboarding" element={<ProtectedRoute requireBaby={false}><Onboarding /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute requireBaby={false}><Dashboard /></ProtectedRoute>} />
                    <Route path="/memories" element={<ProtectedRoute requireBaby={false}><Memories /></ProtectedRoute>} />
                    <Route path="/milestones" element={<ProtectedRoute requireBaby={false}><Milestones /></ProtectedRoute>} />
                    <Route path="/activities" element={<ProtectedRoute requireBaby={false}><Activities /></ProtectedRoute>} />
                    <Route path="/health" element={<ProtectedRoute requireBaby={false}><Health /></ProtectedRoute>} />
                    <Route path="/rewards" element={<ProtectedRoute requireBaby={false}><Rewards /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute requireBaby={false}><Settings /></ProtectedRoute>} />
                    <Route path="/meus-pedidos" element={<ProtectedRoute requireBaby={false}><MeusPedidos /></ProtectedRoute>} />
                    <Route path="/loja/*" element={<ProtectedRoute requireBaby={false}><LojaRoutes /></ProtectedRoute>} />

                    {/* Rotas do painel administrativo */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/users" element={<ProtectedAdminRoute><AdminLayout><AdminUsers /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/milestones" element={<ProtectedAdminRoute><AdminLayout><AdminMilestones /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/plans" element={<ProtectedAdminRoute><AdminLayout><AdminPlans /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/gamification" element={<ProtectedAdminRoute><AdminLayout><AdminGamification /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminLayout><AdminNotifications /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/marketing" element={<ProtectedAdminRoute><AdminLayout><AdminMarketing /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/loja" element={<ProtectedAdminRoute><AdminLayout><AdminLoja /></AdminLayout></ProtectedAdminRoute>} />
                    <Route path="/admin/pedidos" element={<ProtectedAdminRoute><AdminLayout><AdminPedidos /></AdminLayout></ProtectedAdminRoute>} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AdminAuthProvider>
          </GamificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
