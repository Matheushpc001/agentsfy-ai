
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bot, Zap, FileText, Library } from "lucide-react";
import PlanInfoCard from "./PlanInfoCard";

interface AgentHeaderProps {
  totalAgents: number;
  agentLimit: number;
  connectedAgents: number;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  onCreateClick: () => void;
  onManagePromptsClick: () => void;
}

export default function AgentHeader({
  totalAgents,
  agentLimit,
  connectedAgents,
  planName,
  billingCycle,
  onCreateClick,
  onManagePromptsClick
}: AgentHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Agentes de IA
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Gerencie seus agentes virtuais para atendimento automatizado
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button 
            onClick={onManagePromptsClick} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Library className="h-4 w-4" />
            Biblioteca de Prompts
          </Button>
          <Button onClick={onCreateClick} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <Bot className="h-3 w-3" />
              Total de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {totalAgents}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              de {agentLimit} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Agentes Conectados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-green-900 dark:text-green-100">
              {connectedAgents}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              WhatsApp conectado
            </p>
          </CardContent>
        </Card>

        <PlanInfoCard 
          planName={planName}
          billingCycle={billingCycle}
          agentsUsed={totalAgents}
          agentLimit={agentLimit}
          compact={true}
        />
      </div>
    </div>
  );
}
