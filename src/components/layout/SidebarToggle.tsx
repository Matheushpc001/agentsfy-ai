
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
    <Button variant="ghost" size="icon" onClick={onToggle} className="flex-shrink-0">
      <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
