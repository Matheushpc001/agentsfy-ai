
import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = w-64

  useEffect(() => {
    const handleSidebarToggle = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const width = sidebar.offsetWidth;
        setSidebarWidth(width);
      }
    };

    // Initial check
    handleSidebarToggle();

    // Listen for sidebar width changes
    const observer = new ResizeObserver(handleSidebarToggle);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && <Sidebar />}
      <div 
        className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isMobile ? 'flex-1 w-full' : 'flex-1'
        }`}
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        <Header title={title} />
        <ScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="p-4 md:p-6 min-h-full">
            <div className="max-w-full mx-auto pb-16">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
