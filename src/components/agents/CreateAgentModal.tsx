
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Agent } from "@/types";
import { toast } from "sonner";

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (agent: Partial<Agent>) => void;
  editing?: Agent;
}

export default function CreateAgentModal({ open, onClose, onSubmit, editing }: CreateAgentModalProps) {
  const [formData, setFormData] = useState<Partial<Agent>>(
    editing || {
      name: "",
      sector: "",
      prompt: "",
      openAiKey: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sector) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.openAiKey || !formData.openAiKey.startsWith("sk-")) {
      toast.error("Por favor, forneça uma chave válida da OpenAI");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Atendente Virtual"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor / Especialidade</Label>
            <Input
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Ex: Atendimento ao Cliente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt" className="flex justify-between">
              <span>Prompt da IA</span>
              <span className="text-xs text-muted-foreground">
                Instruções para o comportamento do agente
              </span>
            </Label>
            <Textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              placeholder="Descreva como o agente deve se comportar, que tipo de respostas dar, etc."
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="openAiKey" className="flex justify-between">
              <span>Chave da API OpenAI</span>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-primary hover:underline"
              >
                Obter chave
              </a>
            </Label>
            <Input
              id="openAiKey"
              name="openAiKey"
              value={formData.openAiKey}
              onChange={handleChange}
              type="password"
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              Sua chave ficará armazenada de forma segura e será usada apenas para este agente.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editing ? "Salvar Alterações" : "Criar Agente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
