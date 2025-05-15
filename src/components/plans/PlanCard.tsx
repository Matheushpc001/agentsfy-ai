
import { Plan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/constants/plans";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (planId: string) => void;
}

export default function PlanCard({ plan, currentPlanId, onSelect }: PlanCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  
  return (
    <Card className={cn(
      "flex flex-col border-2 transition-all",
      plan.recommended 
        ? "border-primary shadow-md" 
        : isCurrentPlan 
          ? "border-green-500 shadow-sm" 
          : "border-border"
    )}>
      {(plan.recommended || isCurrentPlan) && (
        <div className="absolute top-0 right-0 translate-x-2 -translate-y-2">
          <Badge className={cn(
            "px-3 py-1",
            plan.recommended ? "bg-primary" : "bg-green-500"
          )}>
            {plan.recommended ? "Recomendado" : "Seu Plano"}
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-6">
          <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
          <p className="text-sm text-muted-foreground">
            {plan.billingCycle === "monthly" ? "por mês" : "por ano"}
          </p>
        </div>
        
        <div className="space-y-2">
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan}
          onClick={() => onSelect(plan.id)}
        >
          {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
        </Button>
      </CardFooter>
    </Card>
  );
}
