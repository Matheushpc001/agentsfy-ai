
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Bot, MessageSquare } from "lucide-react";
import WhatsAppConnectionTab from "@/components/ai-sales-agent/WhatsAppConnectionTab";
import AgentConfigTab from "@/components/ai-sales-agent/AgentConfigTab";
import CampaignTab from "@/components/ai-sales-agent/CampaignTab";

export default function AISalesAgent() {
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");

  return (
    <DashboardLayout title="Vendedor IA">
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4 md:mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0 h-auto sm:h-10 p-1">
              <TabsTrigger 
                value="connection"
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Conexão WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="agent" 
                disabled={!isWhatsAppConnected}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Agente IA</span>
                <span className="sm:hidden">Agente</span>
              </TabsTrigger>
              <TabsTrigger 
                value="campaign" 
                disabled={!isWhatsAppConnected}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm whitespace-nowrap"
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Campanha</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* WhatsApp Connection Tab */}
          <TabsContent value="connection" className="mt-4 md:mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <WhatsAppConnectionTab 
                  isWhatsAppConnected={isWhatsAppConnected}
                  setIsWhatsAppConnected={setIsWhatsAppConnected}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="agent" className="mt-4 md:mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <AgentConfigTab setActiveTab={setActiveTab} />
              </div>
            </div>
          </TabsContent>

          {/* Campaign Tab */}
          <TabsContent value="campaign" className="mt-4 md:mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <CampaignTab />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
