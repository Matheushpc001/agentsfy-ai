
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Bot,
  Store,
  Calendar,
  LogOut
} from "lucide-react";
import { UserRole, NavItem } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Menu de navegação para cada tipo de usuário
  const NAV_ITEMS: { [key in UserRole]: NavItem[] } = {
    admin: [
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard" 
      },
      { 
        label: "Franqueados", 
        icon: Users, 
        href: "/admin/franchisees" 
      },
      { 
        label: "Estatísticas", 
        icon: BarChart2, 
        href: "/admin/analytics" 
      },
    ],
    franchisee: [
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard" 
      },
      { 
        label: "Agentes", 
        icon: Bot, 
        href: "/franchisee/agents" 
      },
      { 
        label: "Clientes", 
        icon: Store, 
        href: "/franchisee/customers" 
      },
      { 
        label: "Agenda", 
        icon: Calendar, 
        href: "/franchisee/schedule" 
      },
    ],
    customer: [
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard" 
      },
      { 
        label: "Estatísticas", 
        icon: BarChart2, 
        href: "/customer/dashboard" 
      },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        "bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-50",
        isCollapsed ? "w-16" : "w-64",
        isMobile ? "hidden" : "block"
      )}
    >
      <ScrollArea className="py-4 h-full">
        <div className="space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 text-sm font-semibold tracking-tight">
                  {isCollapsed ? "Menu" : "Painel"}
                </h2>
                {!isMobile && (
                  <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    {isCollapsed ? <LayoutDashboard size={16} /> : <LayoutDashboard size={16} />}
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                )}
              </div>
              <Avatar className="w-9 h-9">
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>
            <div className="space-y-1">
              {NAV_ITEMS[user.role].map((item) => {
                const Icon = item.icon; // Create a capitalized variable to use as a component
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-gray-700"
                    onClick={() => navigate(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4" size={18} />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="px-3 py-2">
            <Button
              variant="ghost"
              className="w-full justify-start dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
