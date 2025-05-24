
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarLogoutProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onNavigate?: () => void;
}

export function SidebarLogout({ isCollapsed, isMobile, onNavigate }: SidebarLogoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("SidebarLogout: Logout clicked");
    logout();
    navigate('/login');
    if (onNavigate) onNavigate();
  };

  return (
    <div className="px-3 py-2 mt-auto">
      <Button
        variant="ghost"
        className="w-full justify-start dark:hover:bg-gray-700 transition-all duration-200 hover:bg-gray-200"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span className={`ml-2 transition-all duration-300 ease-in-out ${isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          Sair
        </span>
      </Button>
    </div>
  );
}
