
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MONTHLY_PLANS, ANNUAL_PLANS, getPlanById } from "@/constants/plans";
import PlanCard from "@/components/plans/PlanCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plan } from "@/types";
import { ArrowRight, Calendar, CalendarCheck, Info } from "lucide-react";
import { formatCurrency } from "@/constants/plans";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Mock data for the current franchisee
const MOCK_FRANCHISEE = {
  id: "franchisee1",
  name: "João Silva",
  email: "joao@exemplo.com",
  role: "franchisee" as const,
  agentCount: 2,
  revenue: 1500,
  isActive: true,
  createdAt: "2023-01-15",
  customerCount: 5,
  planId: "starter-monthly",
  planType: "monthly" as const,
  planExpiresAt: "2023-12-31"
};

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const navigate = useNavigate();
  
  // In a real app, this would come from user context or API
  const currentPlanId = MOCK_FRANCHISEE.planId;
  const currentPlan = currentPlanId ? getPlanById(currentPlanId) : null;
  const plansToShow = billingCycle === "monthly" ? MONTHLY_PLANS : ANNUAL_PLANS;
  
  const handlePlanSelect = (planId: string) => {
    const plan = getPlanById(planId);
    if (plan) {
      setSelectedPlan(plan);
      setConfirmDialog(true);
    }
  };
  
  const handleConfirmPlan = () => {
    if (selectedPlan) {
      // In a real app, this would call an API to update the subscription
      toast.success(`Plano ${selectedPlan.name} ativado com sucesso!`);
      setConfirmDialog(false);
      setSelectedPlan(null);
      
      // In a real app, this would redirect after the API call completes
      setTimeout(() => {
        navigate("/franchisee/agents");
      }, 2000);
    }
  };
  
  return (
    <DashboardLayout title="Planos de Assinatura">
      <div className="space-y-6">
        {/* Current plan overview */}
        {currentPlan && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seu Plano Atual</CardTitle>
              <CardDescription>Detalhes do seu plano de assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">{currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.billingCycle === "monthly" ? "Cobrança mensal" : "Cobrança anual"}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end">
                  <p className="text-lg font-semibold">{formatCurrency(currentPlan.price)}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarCheck className="h-3 w-3" />
                    <span>Próxima cobrança em: 15/06/2025</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Limite de agentes</p>
                  <p className="text-lg font-medium">
                    {MOCK_FRANCHISEE.agentCount} / {currentPlan.agentLimit} agentes
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${(MOCK_FRANCHISEE.agentCount / currentPlan.agentLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Pricing tabs */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Escolha seu plano</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione o melhor plano para as necessidades do seu negócio. Você pode trocar a qualquer momento.
          </p>
          
          <Tabs defaultValue="monthly" value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "annual")} className="w-full max-w-md mx-auto">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansToShow.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>
        
        {/* Help card */}
        <Card className="bg-muted/50 border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Precisa de ajuda para escolher?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Se você não tem certeza de qual plano escolher ou tem dúvidas sobre os recursos,
              nossa equipe de suporte está disponível para ajudar.
            </p>
            <Button variant="link" className="p-0 h-auto mt-2">
              Fale com o suporte
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirm plan dialog */}
      {selectedPlan && (
        <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar alteração de plano</DialogTitle>
              <DialogDescription>
                Você está prestes a alterar seu plano de assinatura.
              </DialogDescription>
            </DialogHeader>
            
            {currentPlan && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Plano atual:</p>
                    <p className="font-medium">{currentPlan.name}</p>
                    <p>{formatCurrency(currentPlan.price)} / {currentPlan.billingCycle === "monthly" ? "mês" : "ano"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Novo plano:</p>
                    <p className="font-medium">{selectedPlan.name}</p>
                    <p>{formatCurrency(selectedPlan.price)} / {selectedPlan.billingCycle === "monthly" ? "mês" : "ano"}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center py-2">
                  <div className="bg-muted w-full h-px" />
                  <ArrowRight className="mx-4 text-muted-foreground" />
                  <div className="bg-muted w-full h-px" />
                </div>
                
                <p className="text-sm text-center">
                  {currentPlan.agentLimit < selectedPlan.agentLimit
                    ? `Você aumentará seu limite de ${currentPlan.agentLimit} para ${selectedPlan.agentLimit} agentes.`
                    : currentPlan.agentLimit > selectedPlan.agentLimit
                      ? `Você reduzirá seu limite de ${currentPlan.agentLimit} para ${selectedPlan.agentLimit} agentes.`
                      : "Você manterá o mesmo limite de agentes, mas com um ciclo de cobrança diferente."
                  }
                </p>
                
                {MOCK_FRANCHISEE.agentCount > selectedPlan.agentLimit && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm">
                    <p>⚠️ Você atualmente possui {MOCK_FRANCHISEE.agentCount} agentes, mas o novo plano permite apenas {selectedPlan.agentLimit}.</p>
                    <p className="mt-1">Se prosseguir, você precisará desativar alguns agentes para ficar dentro do limite do plano.</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmPlan}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
