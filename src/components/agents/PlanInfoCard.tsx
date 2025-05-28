
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PlanInfoCardProps {
  planName: string;
  agentLimit: number;
  billingCycle: string;
  totalAgents: number;
}

export default function PlanInfoCard({
  planName,
  agentLimit,
  billingCycle,
  totalAgents
}: PlanInfoCardProps) {
  const navigate = useNavigate();
  const usagePercentage = (totalAgents / agentLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  
  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-blue-200/80 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:border-blue-800/60 dark:from-blue-950/60 dark:to-indigo-950/60 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/60 flex-shrink-0">
                <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Plano {planName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {billingCycle === "monthly" ? "Cobrança mensal" : "Cobrança anual"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300 truncate">
                  Agentes utilizados
                </span>
                <span className={cn(
                  "font-medium flex-shrink-0",
                  isNearLimit ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-gray-100"
                )}>
                  {totalAgents} de {agentLimit}
                </span>
              </div>
              
              <Progress 
                value={usagePercentage} 
                className={cn(
                  "h-2 transition-all duration-300",
                  isNearLimit && "animate-pulse"
                )}
              />
              
              {isNearLimit && (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Você está próximo do limite do seu plano
                </p>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 group-hover:bg-blue-50 group-hover:border-blue-300 dark:group-hover:bg-blue-950/60 transition-colors duration-200 flex-shrink-0 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
            onClick={() => navigate("/franchisee/plans")}
          >
            <span className="hidden sm:inline">Gerenciar</span>
            <span className="sm:hidden">Planos</span>
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
