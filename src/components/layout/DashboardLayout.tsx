
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
      const sidebar = document.querySelector('aside[data-sidebar]') as HTMLElement;
      if (sidebar) {
        const width = sidebar.offsetWidth;
        setSidebarWidth(width);
      }
    };

    // Initial check
    handleSidebarToggle();

    // Listen for sidebar width changes
    const observer = new ResizeObserver(handleSidebarToggle);
    const sidebar = document.querySelector('aside[data-sidebar]') as HTMLElement;
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900" translate="no">
      {!isMobile && <Sidebar />}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          !isMobile ? '' : 'ml-0'
        }`}
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px'
        }}
        translate="no"
      >
        <Header title={title} />
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6" translate="no">
            <div className="max-w-full mx-auto pb-16">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
