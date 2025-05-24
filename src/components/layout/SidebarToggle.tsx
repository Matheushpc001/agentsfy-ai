
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function SidebarToggle({ isCollapsed, onToggle, isMobile }: SidebarToggleProps) {
  if (isMobile) return null;

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onToggle} 
      className={`flex-shrink-0 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 ${
        isCollapsed ? 'absolute top-4 right-2 z-50' : ''
      }`}
    >
      <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
        isCollapsed ? 'rotate-180' : ''
      }`} />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
