
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { SidebarToggle } from "./SidebarToggle";
import { SidebarNav } from "./SidebarNav";
import { SidebarLogout } from "./SidebarLogout";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!user) return null;

  return (
    <aside
      className={cn(
        "bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full transition-all duration-300 ease-in-out fixed top-0 left-0 z-40",
        isMobile ? "w-64" : (isCollapsed ? "w-16" : "w-64")
      )}
    >
      <ScrollArea className="py-4 h-full">
        <div className="space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className={cn(
              "flex items-center px-3",
              isCollapsed && !isMobile ? "justify-center" : "justify-between"
            )}>
              {(!isCollapsed || isMobile) && (
                <SidebarUserInfo isCollapsed={isCollapsed} isMobile={isMobile} />
              )}
              <SidebarToggle 
                isCollapsed={isCollapsed} 
                onToggle={toggleSidebar} 
                isMobile={isMobile} 
              />
            </div>
            <SidebarNav 
              userRole={user.role} 
              isCollapsed={isCollapsed} 
              isMobile={isMobile} 
              onNavigate={onNavigate} 
            />
          </div>
          <SidebarLogout 
            isCollapsed={isCollapsed} 
            isMobile={isMobile} 
            onNavigate={onNavigate} 
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
