
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  User, 
  Bot, 
  LogOut,
  CircleDollarSign,
  BriefcaseBusiness
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
          { path: "/admin/franchisees", label: "Franqueados", icon: <Users size={20} /> },
          { path: "/admin/analytics", label: "Estatísticas", icon: <BarChart3 size={20} /> },
          { path: "/admin/plans", label: "Planos", icon: <CircleDollarSign size={20} /> },
          { path: "/admin/settings", label: "Configurações", icon: <Settings size={20} /> },
        ];
      case "franchisee":
        return [
          { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
          { path: "/franchisee/agents", label: "Agentes", icon: <Bot size={20} /> },
          { path: "/franchisee/customers", label: "Clientes", icon: <BriefcaseBusiness size={20} /> },
          { path: "/franchisee/analytics", label: "Estatísticas", icon: <BarChart3 size={20} /> },
          { path: "/franchisee/settings", label: "Configurações", icon: <Settings size={20} /> },
        ];
      case "customer":
        return [
          { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
          { path: "/customer/messages", label: "Mensagens", icon: <MessageSquare size={20} /> },
          { path: "/customer/settings", label: "Configurações", icon: <Settings size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (!user) return null;

  const sidebarStyles = isMobile 
    ? "h-full bg-sidebar text-sidebar-foreground w-full flex flex-col"
    : "h-screen fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground w-64 flex flex-col";

  return (
    <aside className={sidebarStyles}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
            <Bot size={24} className="text-primary" />
          </div>
          <div className="ml-3">
            <h1 className="text-white font-bold text-xl">AI Agents</h1>
            <p className="text-white/70 text-xs">WhatsApp Franchise</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )
              }
              onClick={(e) => isMobile && document.querySelector('[data-radix-dialog-close]')?.click()}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-white/70">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              logout();
              if (isMobile) document.querySelector('[data-radix-dialog-close]')?.click();
            }}
          >
            <LogOut size={18} className="mr-2" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
