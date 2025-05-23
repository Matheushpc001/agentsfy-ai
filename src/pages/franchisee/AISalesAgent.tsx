
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
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">
              <Smartphone className="mr-2 h-4 w-4" />
              Conexão WhatsApp
            </TabsTrigger>
            <TabsTrigger 
              value="agent" 
              disabled={!isWhatsAppConnected}
            >
              <Bot className="mr-2 h-4 w-4" />
              Agente IA
            </TabsTrigger>
            <TabsTrigger 
              value="campaign" 
              disabled={!isWhatsAppConnected}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Campanha
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Connection Tab */}
          <TabsContent value="connection">
            <WhatsAppConnectionTab 
              isWhatsAppConnected={isWhatsAppConnected}
              setIsWhatsAppConnected={setIsWhatsAppConnected}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="agent">
            <AgentConfigTab setActiveTab={setActiveTab} />
          </TabsContent>

          {/* Campaign Tab */}
          <TabsContent value="campaign">
            <CampaignTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
