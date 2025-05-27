
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
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

  const handleSheetOpenChange = (open: boolean) => {
    console.log("Header: Sheet open change:", open);
    setIsMenuOpen(open);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Header: Menu button clicked, current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleMenuClick}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                onInteractOutside={e => {
                  console.log("Header: Sheet interact outside");
                  e.preventDefault();
                }} 
                className="p-0 w-[80vw] max-w-[280px] bg-background border-none"
              >
                <div onClick={e => e.stopPropagation()}>
                  <Sidebar onNavigate={() => setIsMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 flex-wrap">
              <span>{getGreeting()}, {user?.name}</span>
              <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                {getRoleDisplay()}
              </span>
            </p>
          </div>
        </div>

        {/* Right Section - Search, Theme, Notifications */}
        <div className="flex items-center gap-2">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="w-[200px] lg:w-[300px] pl-8" 
            />
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              2
            </span>
            <span className="sr-only">Notificações</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
