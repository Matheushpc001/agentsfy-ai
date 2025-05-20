
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
  LogOut,
  ChevronLeft
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
      { 
        label: "Agenda", 
        icon: Calendar, 
        href: "/customer/schedule" 
      },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    // On mobile, close the sidebar after navigation
    if (isMobile) {
      // This will close the sheet via the parent component
      document.body.click(); // Trigger a body click to close the Sheet component
    }
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        "bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full w-full",
        !isMobile && (isCollapsed ? "w-16" : "w-64 fixed")
      )}
    >
      <ScrollArea className="py-4 h-full">
        <div className="space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <h2 className="mb-2 text-sm font-semibold tracking-tight">
                  {isCollapsed && !isMobile ? "" : "Painel"}
                </h2>
                {!isMobile && (
                  <Button variant="ghost" size="icon" onClick={toggleSidebar} className="flex-shrink-0">
                    <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="w-9 h-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {(!isCollapsed || isMobile) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1 px-3">
              {NAV_ITEMS[user.role].map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start text-left dark:hover:bg-gray-700"
                    onClick={() => handleNavigate(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4" size={18} />
                    {(!isCollapsed || isMobile) && item.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="px-3 py-2 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {(!isCollapsed || isMobile) && "Sair"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
