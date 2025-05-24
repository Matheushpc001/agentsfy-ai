
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Bot,
  Store,
  Calendar,
  Search,
  MessageSquareText,
  BookOpen
} from "lucide-react";
import { UserRole, NavItem } from "@/types";

interface SidebarNavProps {
  userRole: UserRole;
  isCollapsed: boolean;
  isMobile: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ userRole, isCollapsed, isMobile, onNavigate }: SidebarNavProps) {
  const navigate = useNavigate();

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
      { 
        label: "Aulas", 
        icon: BookOpen, 
        href: "/admin/lessons" 
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
        label: "Prospecção", 
        icon: Search, 
        href: "/franchisee/prospecting" 
      },
      { 
        label: "Vendedor IA", 
        icon: MessageSquareText, 
        href: "/franchisee/ai-sales-agent" 
      },
      { 
        label: "Agenda", 
        icon: Calendar, 
        href: "/franchisee/schedule" 
      },
      { 
        label: "Aulas", 
        icon: BookOpen, 
        href: "/franchisee/lessons" 
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
        label: "Configurar IA", 
        icon: Bot, 
        href: "/customer/ai-agents" 
      },
      { 
        label: "Agenda", 
        icon: Calendar, 
        href: "/customer/schedule" 
      },
    ],
  };

  const handleNavigate = (href: string) => {
    console.log("SidebarNav: Navigating to:", href);
    navigate(href);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="space-y-1 px-3">
      {NAV_ITEMS[userRole].map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            onClick={() => handleNavigate(item.href)}
          >
            <Icon className="h-4 w-4 flex-shrink-0" size={18} />
            <span className={`ml-2 transition-all duration-300 ease-in-out ${isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
