
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { Bot, ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onManage: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onView, onManage }: CustomerCardProps) {
  // Generate a random color for the customer avatar if no logo is provided
  const getInitials = () => {
    return customer.businessName.substring(0, 2).toUpperCase();
  };
  
  const getRandomColor = () => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-teal-100 text-teal-700",
    ];
    
    const index = customer.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formattedDate = new Date(customer.createdAt).toLocaleDateString("pt-BR");
  
    const customerPortalUrl = `https://agentsfy-ai.lovable.app/a/${customer.id}`;

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          {customer.logo ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={customer.logo} alt={customer.businessName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              getRandomColor()
            )}>
              {getInitials()}
            </div>
          )}
          <div>
            <CardTitle className="text-base font-medium">{customer.businessName}</CardTitle>
            <div className="text-xs text-muted-foreground">Desde {formattedDate}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center">
          <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>{customer.agentCount}</strong> agentes ativos
          </span>
        </div>
        
        <div className="flex items-center text-sm text-primary">
          <Globe className="mr-2 h-4 w-4" />
          <a 
            href={customerPortalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Portal do Cliente
          </a>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(customer)} className="flex-1">
            Visualizar
          </Button>
          <Button variant="default" size="sm" onClick={() => onManage(customer)} className="flex-1">
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
