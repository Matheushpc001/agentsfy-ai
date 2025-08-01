import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

// Import pages
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import Franchisees from "./pages/admin/Franchisees";
import Analytics from "./pages/admin/Analytics";
import Lessons from "./pages/admin/Lessons";
import EvolutionConfig from "./pages/admin/EvolutionConfig";

// Franchisee pages
import Agents from "./pages/franchisee/Agents";
import Prompts from "./pages/franchisee/Prompts";
import Customers from "./pages/franchisee/Customers";
import Schedule from "./pages/franchisee/Schedule";
import Plans from "./pages/franchisee/Plans";
import WhatsAppConnections from "./pages/franchisee/WhatsAppConnections";
import Prospecting from "./pages/franchisee/Prospecting";
import AISalesAgent from "./pages/franchisee/AISalesAgent";
import FranchiseeLessons from "./pages/franchisee/Lessons";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import AIAgentConfig from "./pages/customer/AIAgentConfig";
import CustomerSchedule from "./pages/customer/Schedule";

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show nothing while loading
  if (loading) return null;
  
  // If user is not logged in, redirect to auth page
  if (!user) return <Navigate to="/auth" replace />;
  
  // If user role is not allowed, redirect to dashboard
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  
  return element;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show nothing while loading
  if (loading) return null;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin", "franchisee", "customer"]} />} />
      
      {/* Admin routes */}
      <Route path="/admin/franchisees" element={<ProtectedRoute element={<Franchisees />} allowedRoles={["admin"]} />} />
      <Route path="/admin/analytics" element={<ProtectedRoute element={<Analytics />} allowedRoles={["admin"]} />} />
      <Route path="/admin/evolution-config" element={<ProtectedRoute element={<EvolutionConfig />} allowedRoles={["admin"]} />} />
      <Route path="/admin/lessons" element={<ProtectedRoute element={<Lessons />} allowedRoles={["admin"]} />} />

      {/* Franchisee routes */}
      <Route path="/franchisee/agents" element={<ProtectedRoute element={<Agents />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/prompts" element={<ProtectedRoute element={<Prompts />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/customers" element={<ProtectedRoute element={<Customers />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/schedule" element={<ProtectedRoute element={<Schedule />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/plans" element={<ProtectedRoute element={<Plans />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/whatsapp" element={<ProtectedRoute element={<WhatsAppConnections />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/prospecting" element={<ProtectedRoute element={<Prospecting />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/ai-sales-agent" element={<ProtectedRoute element={<AISalesAgent />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/lessons" element={<ProtectedRoute element={<FranchiseeLessons />} allowedRoles={["franchisee"]} />} />

      {/* Customer routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute element={<CustomerDashboard />} allowedRoles={["customer"]} />} />
      <Route path="/customer/ai-agents" element={<ProtectedRoute element={<AIAgentConfig />} allowedRoles={["customer"]} />} />
      <Route path="/customer/schedule" element={<ProtectedRoute element={<CustomerSchedule />} allowedRoles={["customer"]} />} />
      
      {/* Redirect root to auth or dashboard */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create QueryClient inside the component to ensure proper React context
  const queryClient = useMemo(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          retry: 1,
        },
      },
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
