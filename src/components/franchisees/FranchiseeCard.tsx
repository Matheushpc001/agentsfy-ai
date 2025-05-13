
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Franchisee } from "@/types";
import { Bot, Users, Calendar, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface FranchiseeCardProps {
  franchisee: Franchisee;
  onView: (franchisee: Franchisee) => void;
  onEdit: (franchisee: Franchisee) => void;
}

export default function FranchiseeCard({ franchisee, onView, onEdit }: FranchiseeCardProps) {
  const formattedDate = new Date(franchisee.createdAt).toLocaleDateString("pt-BR");

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            franchisee.isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
          )}>
            <Users size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{franchisee.name}</CardTitle>
            <div className="text-xs text-muted-foreground">{franchisee.email}</div>
          </div>
        </div>
        <Badge className={cn(
          franchisee.isActive 
            ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 hover:bg-red-100 text-red-800 border-red-200"
        )}>
          {franchisee.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{franchisee.agentCount}</strong> agentes
            </span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{franchisee.customerCount}</strong> clientes
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Desde <strong>{formattedDate}</strong>
            </span>
          </div>
          <div className="flex items-center">
            <CircleDollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>R$ {franchisee.revenue.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(franchisee)} className="flex-1">
            Detalhes
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(franchisee)} className="flex-1">
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
