
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentLimit: number;
}

export default function PlanLimitModal({
  isOpen,
  onClose,
  agentLimit
}: PlanLimitModalProps) {
  const navigate = useNavigate();

  const handleUpgradePlan = () => {
    onClose();
    navigate("/franchisee/plans");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limite de Agentes Atingido</DialogTitle>
          <DialogDescription>
            Você atingiu o limite de agentes do seu plano atual.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-center space-y-4">
          <div className="bg-muted p-4 rounded-lg inline-block mx-auto">
            <Bot size={36} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-lg font-medium">{agentLimit}/{agentLimit} Agentes</p>
            <p className="text-sm text-muted-foreground">Limite máximo atingido</p>
          </div>
          
          <p>
            Para criar mais agentes, você precisa fazer upgrade para um plano com maior capacidade.
          </p>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpgradePlan}>
            Ver planos disponíveis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
