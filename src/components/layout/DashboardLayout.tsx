
import { ReactNode } from "react";
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && <Sidebar />}
      <div className={`flex-1 flex flex-col overflow-hidden ${!isMobile ? 'ml-64' : 'ml-0'}`}>
        <Header title={title} />
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            <div className="max-w-full mx-auto pb-16">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
