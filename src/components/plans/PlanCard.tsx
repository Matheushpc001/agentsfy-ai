
import { Plan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, DollarSign, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/constants/plans";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanCardProps {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (planId: string) => void;
}

export default function PlanCard({ plan, currentPlanId, onSelect }: PlanCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isAnnualPlan = plan.billingCycle === "annual";
  const isCustomPlan = plan.isCustom === true;
  const isMobile = useIsMobile();
  
  // Calculate monthly equivalent price for annual plans
  const monthlyEquivalent = isAnnualPlan ? plan.price / 12 : null;
  
  return (
    <Card className={cn(
      "flex flex-col border-2 transition-all",
      plan.recommended 
        ? "border-primary shadow-md" 
        : isCurrentPlan 
          ? "border-green-500 shadow-sm" 
          : isCustomPlan
            ? "border-purple-500 shadow-md"
            : "border-border"
    )}>
      {(plan.recommended || isCurrentPlan || isCustomPlan) && (
        <div className={cn(
          "absolute top-0 right-0 translate-x-2 -translate-y-2",
          isMobile && "translate-x-1 -translate-y-1"
        )}>
          <Badge className={cn(
            "px-3 py-1",
            plan.recommended ? "bg-primary" : isCustomPlan ? "bg-purple-500" : "bg-green-500",
            isMobile && "text-xs px-2 py-0.5"
          )}>
            {plan.recommended ? "Recomendado" : isCurrentPlan ? "Seu Plano" : "Enterprise"}
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-6">
          {isCustomPlan ? (
            <>
              <p className="text-3xl font-bold">Consulte</p>
              <p className="text-sm text-muted-foreground">
                preços personalizados
              </p>
            </>
          ) : isAnnualPlan && monthlyEquivalent ? (
            <>
              <p className="text-3xl font-bold">{formatCurrency(monthlyEquivalent)}<span className="text-sm font-normal">/mês</span></p>
              
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <p className="text-sm">
                  {formatCurrency(plan.price)} por ano
                </p>
              </div>
              
              <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                Economia de 20%
              </Badge>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
              <p className="text-sm text-muted-foreground">
                por mês
              </p>
            </>
          )}
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
          variant={isCurrentPlan ? "outline" : isCustomPlan ? "secondary" : "default"}
          disabled={isCurrentPlan}
          onClick={() => onSelect(plan.id)}
        >
          {isCurrentPlan ? "Plano Atual" : isCustomPlan ? "Falar com Consultor" : "Selecionar Plano"}
        </Button>
      </CardFooter>
    </Card>
  );
}
