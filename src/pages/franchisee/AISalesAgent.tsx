
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Bot, MessageSquare, Zap, CheckCircle } from "lucide-react";
import WhatsAppConnectionTab from "@/components/ai-sales-agent/WhatsAppConnectionTab";
import AgentConfigTab from "@/components/ai-sales-agent/AgentConfigTab";
import CampaignTab from "@/components/ai-sales-agent/CampaignTab";

export default function AISalesAgent() {
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");

  const getStepStatus = (step: string) => {
    if (step === "connection") return isWhatsAppConnected ? "completed" : "active";
    if (step === "agent") return isWhatsAppConnected ? "active" : "pending";
    if (step === "campaign") return isWhatsAppConnected ? "active" : "pending";
    return "pending";
  };

  const steps = [
    {
      id: "connection",
      title: "Conectar WhatsApp",
      description: "Conecte sua conta do WhatsApp",
      icon: Smartphone,
    },
    {
      id: "agent",
      title: "Configurar Agente",
      description: "Configure seu agente de IA",
      icon: Bot,
    },
    {
      id: "campaign",
      title: "Criar Campanha",
      description: "Lance sua campanha de vendas",
      icon: MessageSquare,
    },
  ];

  return (
    <DashboardLayout title="Vendedor IA">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 md:mb-6">
              <Zap className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-4">
              Vendedor IA Inteligente
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Automatize suas vendas com inteligência artificial. Configure seu agente em poucos passos.
            </p>
          </div>

          {/* Progress Steps - Only show on desktop */}
          <div className="hidden lg:block mb-12">
            <div className="flex justify-center">
              <div className="flex items-center space-x-8">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300
                            ${status === "completed" 
                              ? "bg-green-500 border-green-500 text-white" 
                              : status === "active"
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-gray-100 border-gray-300 text-gray-400"
                            }
                          `}
                        >
                          {status === "completed" ? (
                            <CheckCircle className="h-8 w-8" />
                          ) : (
                            <Icon className="h-8 w-8" />
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {step.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-24 h-0.5 bg-gray-300 dark:bg-gray-600 mx-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <div className="flex justify-center mb-6 md:mb-8">
                <Card className="p-1 bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto bg-transparent p-0">
                    <TabsTrigger 
                      value="connection"
                      className="flex items-center justify-center gap-2 py-3 px-4 md:px-6 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 min-w-[120px] sm:min-w-[140px]"
                    >
                      <Smartphone className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Conexão WhatsApp</span>
                      <span className="sm:hidden">WhatsApp</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="agent" 
                      disabled={!isWhatsAppConnected}
                      className="flex items-center justify-center gap-2 py-3 px-4 md:px-6 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
                    >
                      <Bot className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Agente IA</span>
                      <span className="sm:hidden">Agente</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="campaign" 
                      disabled={!isWhatsAppConnected}
                      className="flex items-center justify-center gap-2 py-3 px-4 md:px-6 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span>Campanha</span>
                    </TabsTrigger>
                  </TabsList>
                </Card>
              </div>

              {/* Tab Content */}
              <div className="w-full max-w-5xl mx-auto">
                <TabsContent value="connection" className="mt-0">
                  <div className="animate-fade-in">
                    <WhatsAppConnectionTab 
                      isWhatsAppConnected={isWhatsAppConnected}
                      setIsWhatsAppConnected={setIsWhatsAppConnected}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="agent" className="mt-0">
                  <div className="animate-fade-in">
                    <AgentConfigTab setActiveTab={setActiveTab} />
                  </div>
                </TabsContent>

                <TabsContent value="campaign" className="mt-0">
                  <div className="animate-fade-in">
                    <CampaignTab />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
