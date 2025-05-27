
import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Força uma re-renderização após a montagem para garantir
    // que o layout seja preservado mesmo após tradução
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Previne flash de conteúdo não estilizado durante carregamento
  if (!isReady) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <div className="flex items-center justify-center w-full">
          <div className="animate-pulse text-primary">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background" translate="no">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header title={title} />
          <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
            <main className="container-padding">
              <div className="max-w-full mx-auto section-spacing pb-16">
                {children}
              </div>
            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
