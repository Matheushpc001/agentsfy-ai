
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="font-medium">Plano atual: {planName}</h3>
        <p className="text-sm text-muted-foreground">
          Limite de {agentLimit} agentes • {billingCycle === "monthly" ? "Mensal" : "Anual"}
        </p>
        <div className="mt-2 w-full sm:max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span>{totalAgents} agentes usados</span>
            <span>{agentLimit} total</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${(totalAgents / agentLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="shrink-0"
        onClick={() => navigate("/franchisee/plans")}
      >
        Gerenciar Plano
      </Button>
    </div>
  );
}
