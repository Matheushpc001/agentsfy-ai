
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Agentes de IA
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Gerencie seus agentes virtuais para atendimento automatizado
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button 
            onClick={onManagePromptsClick} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Library className="h-4 w-4" />
            Biblioteca de Prompts
          </Button>
          <Button onClick={onCreateClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Agente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Total de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalAgents}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              de {agentLimit} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Agentes Conectados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {connectedAgents}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              WhatsApp conectado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Taxa de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {Math.round((totalAgents / agentLimit) * 100)}%
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              do plano utilizado
            </p>
          </CardContent>
        </Card>

        <PlanInfoCard 
          planName={planName}
          billingCycle={billingCycle}
          agentsUsed={totalAgents}
          agentLimit={agentLimit}
        />
      </div>
    </div>
  );
}
