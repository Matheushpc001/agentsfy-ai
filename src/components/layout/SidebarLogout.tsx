
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function SidebarLogout() {
  const { logout } = useAuth();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
      onClick={logout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}
