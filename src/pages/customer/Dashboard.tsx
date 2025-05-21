
import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent, Customer } from "@/types";
import WhatsAppConnectionCard from '@/components/whatsapp/WhatsAppConnectionCard';

// Mock data for demonstration
const MOCK_CUSTOMER: Customer = {
  id: "customer1",
  name: "João Silva",
  email: "joao@empresaa.com",
  businessName: "Empresa A",
  role: "customer",
  franchiseeId: "franchisee1",
  agentCount: 1,
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  document: "12.345.678/0001-90",
  contactPhone: "+5511977777777",
};

const MOCK_AGENT: Agent = {
  id: "agent1",
  name: "Atendente Virtual",
  sector: "Atendimento ao Cliente",
  prompt: "Você é um atendente virtual especializado em responder dúvidas sobre produtos e serviços da empresa.",
  isActive: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  customerId: "customer1",
  franchiseeId: "franchisee1",
  openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
  whatsappConnected: false,
  messageCount: 0,
  responseTime: 0,
};

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer>(MOCK_CUSTOMER);
  const [agent, setAgent] = useState<Agent>(MOCK_AGENT);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleRefreshAgent = (updatedAgent: Agent) => {
    setAgent({ ...updatedAgent, whatsappConnected: true });
  };

  return (
    <DashboardLayout title="Dashboard do Cliente">
      <div className="space-y-6">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Perfil da Empresa</CardTitle>
                  <CardDescription>Informações do seu negócio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome da Empresa</p>
                      <p className="font-medium">{customer.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsável</p>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                    {customer.document && (
                      <div>
                        <p className="text-sm text-muted-foreground">CNPJ/CPF</p>
                        <p className="font-medium">{customer.document}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <WhatsAppConnectionCard agent={agent} onRefresh={handleRefreshAgent} />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                  <CardDescription>Desempenho do seu agente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Mensagens Processadas</p>
                      <p className="font-medium">{agent.messageCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                      <p className="font-medium">{agent.responseTime || "-"} segundos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status do Agente</p>
                      <p className={`font-medium ${agent.isActive ? "text-green-500" : "text-red-500"}`}>
                        {agent.isActive ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos Recentes</CardTitle>
                <CardDescription>Últimos compromissos marcados pelo seu agente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum agendamento recente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Mensagens</CardTitle>
                <CardDescription>Mensagens processadas pelo seu agente de IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {agent.whatsappConnected 
                      ? "Seu agente está conectado, mas ainda não processou nenhuma mensagem" 
                      : "Conecte seu WhatsApp para começar a receber mensagens"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Gerencie as configurações do seu agente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para configurações avançadas do agente, utilize a página "Configurar IA" no menu lateral.
                </p>
                <p className="text-sm">
                  Para reconectar o WhatsApp ou alterar suas informações de perfil, entre em contato com seu franqueado.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
