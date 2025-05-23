
import { Bot } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface TopFranchisee {
  id: string;
  name: string;
  revenue: number;
  agentCount: number;
  isActive: boolean;
}

interface TopFranchiseesCardProps {
  franchisees: TopFranchisee[];
  className?: string;
}

export function TopFranchiseesCard({ franchisees, className }: TopFranchiseesCardProps) {
  const isMobile = useIsMobile();
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Sort franchisees by revenue (highest to lowest)
  const sortedFranchisees = [...franchisees].sort((a, b) => b.revenue - a.revenue);
  
  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-center sm:text-left">
          Top Franqueados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedFranchisees.length > 0 ? (
            sortedFranchisees.map(franchisee => (
              <div 
                key={franchisee.id} 
                className="flex items-center p-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
              >
                <div className="mr-3 h-10 w-10 rounded-full bg-sky-600/10 flex items-center justify-center">
                  <Bot size={20} className="text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{franchisee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(franchisee.revenue)} • {franchisee.agentCount} agentes
                  </p>
                </div>
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full", 
                  franchisee.isActive ? "bg-green-500" : "bg-gray-300"
                )}></div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
              <Bot className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>Nenhum franqueado cadastrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
