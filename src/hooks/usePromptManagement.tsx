
import { useState } from "react";
import { Prompt } from "@/types/prompts";
import { MOCK_PROMPTS } from "@/mocks/promptsMockData";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export default function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>(MOCK_PROMPTS);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isEditPromptModalOpen, setIsEditPromptModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);

  const createPrompt = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    const newPrompt: Prompt = {
      id: uuidv4(),
      ...promptData,
      createdAt: new Date().toISOString(),
    };

    setPrompts((prev) => [...prev, newPrompt]);
    toast.success(`Prompt "${promptData.name}" criado com sucesso!`);
    return newPrompt;
  };

  const updatePrompt = (id: string, promptData: Partial<Prompt>) => {
    setPrompts((prev) => 
      prev.map((prompt) => 
        prompt.id === id ? { ...prompt, ...promptData } : prompt
      )
    );
    toast.success(`Prompt "${promptData.name || 'Selecionado'}" atualizado com sucesso!`);
  };

  const deletePrompt = (id: string) => {
    const promptToDelete = prompts.find(prompt => prompt.id === id);
    if (promptToDelete?.isDefault) {
      toast.error("Não é possível excluir prompts padrão do sistema.");
      return;
    }
    
    setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
    toast.success("Prompt excluído com sucesso!");
  };

  const getPromptsByNiche = (niche?: string) => {
    if (!niche) return prompts;
    return prompts.filter((prompt) => prompt.niche === niche);
  };

  const getAllNiches = () => {
    const niches = [...new Set(prompts.map((prompt) => prompt.niche))];
    return niches;
  };

  const openPromptModal = () => {
    setCurrentPrompt(null);
    setIsPromptModalOpen(true);
  };

  const openEditPromptModal = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsEditPromptModalOpen(true);
  };

  return {
    prompts,
    isPromptModalOpen,
    isEditPromptModalOpen,
    currentPrompt,
    setIsPromptModalOpen,
    setIsEditPromptModalOpen,
    setCurrentPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByNiche,
    getAllNiches,
    openPromptModal,
    openEditPromptModal
  };
}
