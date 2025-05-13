
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Import pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import Franchisees from "./pages/admin/Franchisees";
import Analytics from "./pages/admin/Analytics";

// Franchisee pages
import Agents from "./pages/franchisee/Agents";
import Customers from "./pages/franchisee/Customers";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";

const queryClient = new QueryClient();

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show nothing while loading
  if (loading) return null;
  
  // If user is not logged in, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  
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
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin", "franchisee", "customer"]} />} />
      
      {/* Admin routes */}
      <Route path="/admin/franchisees" element={<ProtectedRoute element={<Franchisees />} allowedRoles={["admin"]} />} />
      <Route path="/admin/analytics" element={<ProtectedRoute element={<Analytics />} allowedRoles={["admin"]} />} />

      {/* Franchisee routes */}
      <Route path="/franchisee/agents" element={<ProtectedRoute element={<Agents />} allowedRoles={["franchisee"]} />} />
      <Route path="/franchisee/customers" element={<ProtectedRoute element={<Customers />} allowedRoles={["franchisee"]} />} />

      {/* Customer routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute element={<CustomerDashboard />} allowedRoles={["customer"]} />} />
      
      {/* Redirect root to login or dashboard */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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

export default App;
