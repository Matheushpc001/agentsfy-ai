
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
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Plano {planName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {billingCycle === "monthly" ? "Cobrança mensal" : "Cobrança anual"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Agentes utilizados
                </span>
                <span className={cn(
                  "font-medium",
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
            className="ml-4 group-hover:bg-blue-50 group-hover:border-blue-300 dark:group-hover:bg-blue-950/50 transition-colors duration-200"
            onClick={() => navigate("/franchisee/plans")}
          >
            Gerenciar
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
