
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Settings, Plus, Edit, Trash2 } from "lucide-react";
import AIAgentSetup from "./AIAgentSetup";
import { useState } from "react";

interface AIAgentConfigProps {
  isOpen: boolean;
  onClose: () => void;
  evolutionConfigId: string;
  instanceName: string;
  aiAgents: any[];
}

export default function AIAgentConfig({ 
  isOpen, 
  onClose, 
  evolutionConfigId, 
  instanceName,
  aiAgents 
}: AIAgentConfigProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  const handleCreateAgent = async (agentData: any) => {
    console.log('Creating agent:', agentData);
    setShowCreateForm(false);
  };

  const handleUpdateAgent = async (agentId: string, updates: any) => {
    console.log('Updating agent:', agentId, updates);
    setEditingAgent(null);
  };

  const handleEditAgent = (agent: any) => {
    setEditingAgent(agent);
    setShowCreateForm(true);
  };

  const activeAgents = aiAgents.filter(agent => agent.is_active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes IA - {instanceName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total de Agentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiAgents.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agentes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeAgents.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Botão para criar novo agente */}
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agente IA
            </Button>
          </div>

          {/* Formulário de criação/edição */}
          {showCreateForm && (
            <AIAgentSetup
              evolutionConfigId={evolutionConfigId}
              onCreateAgent={handleCreateAgent}
              onUpdateAgent={handleUpdateAgent}
              existingAgent={editingAgent}
              agents={aiAgents}
            />
          )}

          {/* Lista de agentes existentes */}
          {aiAgents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agentes Configurados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAgents.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{agent.agent_id}</CardTitle>
                        <Badge variant={agent.is_active ? "default" : "secondary"}>
                          {agent.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>📱 {agent.phone_number}</p>
                        <p>🤖 {agent.model}</p>
                        <p>⏱️ Delay: {agent.response_delay_seconds}s</p>
                        {agent.system_prompt && (
                          <p className="truncate">💬 {agent.system_prompt.substring(0, 50)}...</p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAgent(agent)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
