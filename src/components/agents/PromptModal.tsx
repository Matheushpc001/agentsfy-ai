
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Prompt } from "@/types/prompts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promptData: Omit<Prompt, 'id' | 'createdAt'>) => void;
  editing?: Prompt | null;
  allNiches: string[];
}

export default function PromptModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editing, 
  allNiches 
}: PromptModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    text: string;
    niche: string;
    customNiche: string;
  }>({
    name: "",
    text: "",
    niche: "",
    customNiche: "",
  });

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setFormData({
          name: editing.name,
          text: editing.text,
          niche: editing.niche,
          customNiche: "",
        });
      } else {
        setFormData({
          name: "",
          text: "",
          niche: "",
          customNiche: "",
        });
      }
    }
  }, [isOpen, editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      niche: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.text) {
      return;
    }

    // Use custom niche if selected or entered
    const finalNiche = formData.niche === "custom" 
      ? formData.customNiche 
      : formData.niche;

    if (!finalNiche) {
      return;
    }

    onSubmit({
      name: formData.name,
      text: formData.text,
      niche: finalNiche,
      isDefault: editing?.isDefault || false
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Prompt" : "Criar Novo Prompt"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Prompt</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Vendedor de Imóveis"
              disabled={editing?.isDefault}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="niche">Nicho</Label>
            <Select 
              value={formData.niche} 
              onValueChange={handleSelectChange}
              disabled={editing?.isDefault}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um nicho" />
              </SelectTrigger>
              <SelectContent>
                {allNiches.map(niche => (
                  <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                ))}
                <SelectItem value="custom">Outro (personalizado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.niche === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customNiche">Nicho Personalizado</Label>
              <Input
                id="customNiche"
                name="customNiche"
                value={formData.customNiche}
                onChange={handleChange}
                placeholder="Ex: Educação Online"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="text">Texto do Prompt</Label>
            <Textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Descreva como o agente deve se comportar..."
              rows={8}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editing ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
