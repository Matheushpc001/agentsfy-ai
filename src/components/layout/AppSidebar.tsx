
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Bot,
  Store,
  Calendar,
  BookOpen,
  LogOut,
  FileText,
  Settings
} from "lucide-react";
import { UserRole, NavItem } from "@/types";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Menu de navegação para cada tipo de usuário
  const NAV_ITEMS: { [key in UserRole]: NavItem[] } = {
    admin: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Franqueados", icon: Users, href: "/admin/franchisees" },
      { label: "Estatísticas", icon: BarChart2, href: "/admin/analytics" },
      { label: "Evolution API", icon: Settings, href: "/admin/evolution-config" },
      { label: "Aulas", icon: BookOpen, href: "/admin/lessons" },
    ],
    franchisee: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Agentes", icon: Bot, href: "/franchisee/agents" },
      { label: "Prompts", icon: FileText, href: "/franchisee/prompts" },
      { label: "Clientes", icon: Store, href: "/franchisee/customers" },
      { label: "Agenda", icon: Calendar, href: "/franchisee/schedule" },
      { label: "Aulas", icon: BookOpen, href: "/franchisee/lessons" },
    ],
    customer: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Estatísticas", icon: BarChart2, href: "/customer/dashboard" },
      { label: "Configurar IA", icon: Bot, href: "/customer/ai-agents" },
      { label: "Agenda", icon: Calendar, href: "/customer/schedule" },
    ],
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = () => {
    switch (user?.role) {
      case "admin":
        return "Administrador Master";
      case "franchisee":
        return "Franqueado";
      case "customer":
        return "Cliente";
      default:
        return "";
    }
  };

  return (
    <Sidebar className="border-r border-border bg-background" translate="no">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-9 h-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">
              {getRoleDisplay()}
            </span>
          </div>
        </div>
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS[user.role].map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigate(item.href)}
                      tooltip={item.label}
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              tooltip="Sair"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
