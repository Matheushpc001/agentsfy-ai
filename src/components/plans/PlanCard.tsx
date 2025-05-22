import { Plan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/constants/plans";
import { cn } from "@/lib/utils";
interface PlanCardProps {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (planId: string) => void;
}
export default function PlanCard({
  plan,
  currentPlanId,
  onSelect
}: PlanCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isAnnualPlan = plan.billingCycle === "annual";

  // Calculate monthly equivalent price for annual plans
  const monthlyEquivalent = isAnnualPlan ? plan.price / 12 : null;
  return <Card className={cn("flex flex-col border-2 transition-all", plan.recommended ? "border-primary shadow-md" : isCurrentPlan ? "border-green-500 shadow-sm" : "border-border")}>
      {(plan.recommended || isCurrentPlan) && <div className="absolute top-0 right-0 translate-x-2 -translate-y-2">
          
        </div>}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-6">
          {isAnnualPlan && monthlyEquivalent ? <>
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
            </> : <>
              <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
              <p className="text-sm text-muted-foreground">
                por mês
              </p>
            </>}
        </div>
        
        <div className="space-y-2">
          {plan.features?.map((feature, index) => <div key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>)}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" variant={isCurrentPlan ? "outline" : "default"} disabled={isCurrentPlan} onClick={() => onSelect(plan.id)}>
          {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
        </Button>
      </CardFooter>
    </Card>;
}