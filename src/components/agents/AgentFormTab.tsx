
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { Agent } from "@/types";
import { Prompt } from "@/types/prompts";

interface AgentFormTabProps {
  formData: Partial<Agent>;
  prompts: Prompt[];
  selectedPromptId: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPromptSelect: (value: string) => void;
  onOpenPromptsLibrary?: () => void;
  onNext: () => void;
  knowledgeBaseFile: File | null;
}

export default function AgentFormTab({
  formData,
  prompts,
  selectedPromptId,
  onFormChange,
  onSwitchChange,
  onFileChange,
  onPromptSelect,
  onOpenPromptsLibrary,
  onNext,
  knowledgeBaseFile
}: AgentFormTabProps) {
  
  const handleNextClick = () => {
    console.log('=== BOTÃO PRÓXIMO CLICADO ===');
    console.log('FormData no AgentFormTab:', JSON.stringify(formData, null, 2));
    console.log('Campos obrigatórios:');
    console.log('- name:', formData.name);
    console.log('- sector:', formData.sector); 
    console.log('- openAiKey:', formData.openAiKey ? 'PRESENTE' : 'AUSENTE');
    console.log('Chamando onNext()...');
    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Agente *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={onFormChange}
          placeholder="Ex: Atendente Virtual"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sector">Setor / Especialidade *</Label>
        <Input
          id="sector"
          name="sector"
          value={formData.sector || ""}
          onChange={onFormChange}
          placeholder="Ex: Atendimento ao Cliente"
          required
        />
      </div>
      
      {/* Prompt Selection */}
      <div className="space-y-2">
        <Label htmlFor="promptSelector" className="flex justify-between">
          <span>Selecionar Prompt</span>
          {onOpenPromptsLibrary && (
            <Button 
              type="button" 
              variant="link" 
              className="h-auto p-0 text-xs"
              onClick={onOpenPromptsLibrary}
            >
              Ver biblioteca de prompts
            </Button>
          )}
        </Label>
        <Select value={selectedPromptId} onValueChange={onPromptSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um prompt pré-definido" />
          </SelectTrigger>
          <SelectContent>
            {prompts.map(prompt => (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.name} ({prompt.niche})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={formData.prompt || ""}
          onChange={onFormChange}
          placeholder="Descreva como o agente deve se comportar, que tipo de respostas dar, etc."
          rows={5}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="openAiKey" className="flex justify-between">
          <span>Chave da API OpenAI *</span>
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
          value={formData.openAiKey || ""}
          onChange={onFormChange}
          type="password"
          placeholder="sk-..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Sua chave ficará armazenada de forma segura e será usada apenas para este agente.
        </p>
      </div>

      {/* Voice Recognition Switch */}
      <div className="flex items-center justify-between space-y-0 py-4 border-t">
        <div>
          <h4 className="font-medium text-sm">Habilitar reconhecimento de voz</h4>
          <p className="text-xs text-muted-foreground">
            Permite que o agente processe mensagens de áudio usando a Whisper API.
          </p>
        </div>
        <Switch 
          checked={formData.enableVoiceRecognition || false} 
          onCheckedChange={onSwitchChange}
        />
      </div>
      
      {/* Knowledge Base Upload */}
      <div className="space-y-2 border-t pt-4">
        <Label className="text-base">Base de conhecimento</Label>
        <div className="grid gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              Opcional: Adicione uma base de conhecimento para seu agente (PDF, DOC, URL).
            </p>
            
            <div className="flex gap-2">
              <Input
                id="knowledgeBase"
                name="knowledgeBase"
                value={formData.knowledgeBase || ""}
                onChange={onFormChange}
                placeholder="Insira URL ou selecione um arquivo"
              />
              
              <div className="relative">
                <Input 
                  type="file" 
                  id="file-upload" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={onFileChange}
                />
                <Button type="button" variant="outline" className="flex items-center h-full">
                  <Upload size={18} className="mr-1" />
                  Arquivo
                </Button>
              </div>
            </div>
            
            {knowledgeBaseFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Arquivo selecionado: {knowledgeBaseFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="button" 
          onClick={handleNextClick}
          className="bg-primary hover:bg-primary/90"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
