import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings, TrendingUp } from "lucide-react";

interface PlanInfoCardProps {
  planName: string;
  agentLimit: number;
  billingCycle: string;
  agentsUsed: number;
  compact?: boolean;
}

export default function PlanInfoCard({
  planName,
  agentLimit,
  billingCycle,
  agentsUsed,
  compact = false
}: PlanInfoCardProps) {
  const navigate = useNavigate();
  const usagePercentage = (agentsUsed / agentLimit) * 100;
  
  // Define colors based on usage percentage
  const getProgressColor = () => {
    if (usagePercentage >= 90) return "bg-gradient-to-r from-red-500 to-red-600";
    if (usagePercentage >= 70) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-blue-500 to-purple-600";
  };
  
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{planName}</h3>
          <div className="flex justify-between text-xs mb-2 text-gray-600 dark:text-gray-400">
            <span className="font-medium">{agentsUsed} agentes</span>
            <span>{agentLimit} total</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`${getProgressColor()} h-2 rounded-full transition-all duration-500 ease-out shadow-sm`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="shrink-0 text-xs px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600 text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 font-medium transition-all duration-200"
          onClick={() => navigate("/franchisee/plans")}
        >
          <Settings className="w-3 h-3 mr-1" />
          Gerenciar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Plano atual: {planName}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Limite de {agentLimit} agentes • {billingCycle === "monthly" ? "Mensal" : "Anual"}
        </p>
        <div className="w-full sm:max-w-xs">
          <div className="flex justify-between text-xs mb-2 text-gray-600 dark:text-gray-400">
            <span className="font-medium">{agentsUsed} agentes usados</span>
            <span className="font-medium">{agentLimit} total</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`${getProgressColor()} h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {usagePercentage.toFixed(1)}% utilizado
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="shrink-0 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600 text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => navigate("/franchisee/plans")}
      >
        <Settings className="w-4 h-4 mr-2" />
        Gerenciar Plano
      </Button>
    </div>
  );
}
