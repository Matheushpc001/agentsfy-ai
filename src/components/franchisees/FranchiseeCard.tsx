
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Franchisee } from "@/types";
import { Bot, Users, Calendar, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FranchiseeCardProps {
  franchisee: Franchisee;
  onView: (franchisee: Franchisee) => void;
  onEdit: (franchisee: Franchisee) => void;
  onDelete: (franchisee: Franchisee) => void;
}

export default function FranchiseeCard({ franchisee, onView, onEdit, onDelete }: FranchiseeCardProps) {
  const formattedDate = new Date(franchisee.createdAt).toLocaleDateString("pt-BR");

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 h-full">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-3 md:p-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className={cn(
            "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center",
            franchisee.isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
          )}>
            <Users size={18} />
          </div>
          <div>
            <CardTitle className="text-sm md:text-base font-medium line-clamp-1">{franchisee.name}</CardTitle>
            <div className="text-xs text-muted-foreground line-clamp-1">{franchisee.email}</div>
          </div>
        </div>
        <Badge className={cn(
          "text-xs",
          franchisee.isActive 
            ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 hover:bg-red-100 text-red-800 border-red-200"
        )}>
          {franchisee.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="flex items-center">
            <Bot className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4 text-muted-foreground" />
            <span className="text-xs md:text-sm">
              <strong>{franchisee.agentCount}</strong> agentes
            </span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4 text-muted-foreground" />
            <span className="text-xs md:text-sm">
              <strong>{franchisee.customerCount}</strong> clientes
            </span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4 text-muted-foreground" />
            <span className="text-xs md:text-sm">
              Desde <strong>{formattedDate}</strong>
            </span>
          </div>
          <div className="flex items-center">
            {/* Removed CircleDollarSign since it's not in the approved icons list */}
            <Bot className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4 text-muted-foreground" />
            <span className="text-xs md:text-sm">
              <strong>R$ {franchisee.revenue.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <div className="flex space-x-1 pt-1 md:pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(franchisee)} className="flex-1 text-xs md:text-sm h-8 md:h-9">
            Detalhes
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(franchisee)} className="flex-1 text-xs md:text-sm h-8 md:h-9">
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(franchisee)} className="flex-1 text-xs md:text-sm h-8 md:h-9">
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
