
import { useState } from "react";
import { Prompt } from "@/types/prompts";
import { MOCK_PROMPTS } from "@/mocks/promptsMockData";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export default function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>(MOCK_PROMPTS);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPromptsLibraryModalOpen, setIsPromptsLibraryModalOpen] = useState(false);
  const [isPromptsManagementModalOpen, setIsPromptsManagementModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [selectedPromptForAgent, setSelectedPromptForAgent] = useState<Prompt | null>(null);

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

  const getAllNiches = () => {
    const niches = [...new Set(prompts.map((prompt) => prompt.niche))];
    return niches;
  };

  // Handler functions
  const handleSubmitPrompt = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    if (currentPrompt) {
      updatePrompt(currentPrompt.id, promptData);
    } else {
      createPrompt(promptData);
    }
    setIsPromptModalOpen(false);
    setCurrentPrompt(null);
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPromptForAgent(prompt);
    setIsPromptsLibraryModalOpen(false);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsPromptModalOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    deletePrompt(id);
  };

  const handleCreatePrompt = () => {
    setCurrentPrompt(null);
    setIsPromptModalOpen(true);
  };

  return {
    prompts,
    currentPrompt,
    isPromptModalOpen,
    isPromptsLibraryModalOpen,
    isPromptsManagementModalOpen,
    selectedPromptForAgent,
    allNiches: getAllNiches(),
    setIsPromptModalOpen,
    setIsPromptsLibraryModalOpen,
    setIsPromptsManagementModalOpen,
    handleSubmitPrompt,
    handleSelectPrompt,
    handleEditPrompt,
    handleDeletePrompt,
    handleCreatePrompt,
  };
}
