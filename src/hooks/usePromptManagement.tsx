import { useState, useEffect } from "react";
import { Prompt } from "@/types/prompts";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

// Prompts padrão que serão usados como fallback
const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: uuidv4(),
    name: "Atendimento Restaurante",
    text: "Você é um assistente de atendimento para um restaurante. Você deve ser educado, prestativo e conhecer o cardápio completo. Quando os clientes perguntarem sobre pratos, sempre mencione os ingredientes e se há opções vegetarianas ou veganas disponíveis. Se perguntarem sobre reservas, peça data, horário e número de pessoas.",
    niche: "Gastronomia",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: uuidv4(),
    name: "Vendedor Imobiliário",
    text: "Você é um corretor de imóveis experiente. Ao conversar com clientes, faça perguntas sobre o tipo de imóvel que procuram, localização preferida, orçamento e necessidades específicas como número de quartos. Apresente imóveis que correspondam às necessidades dos clientes e destaque os benefícios de cada propriedade.",
    niche: "Imobiliário",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: uuidv4(),
    name: "Suporte Técnico E-commerce",
    text: "Você é um especialista em suporte técnico para uma loja de e-commerce. Ajude os clientes com problemas de pedidos, rastreamento, devoluções e questões técnicas do site. Seja paciente e detalhado nas suas respostas. Se não conseguir resolver o problema, ofereça encaminhar para um especialista humano.",
    niche: "E-commerce",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: uuidv4(),
    name: "Consultor Fitness",
    text: "Você é um consultor fitness e nutricional. Ajude os clientes com dúvidas sobre exercícios, dietas e hábitos saudáveis. Peça informações como idade, objetivos, condições médicas existentes e experiência prévia. Lembre sempre de mencionar que suas orientações são gerais e não substituem a consulta com profissionais de saúde.",
    niche: "Saúde e Bem-estar",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: uuidv4(),
    name: "Assistente de Viagens",
    text: "Você é um agente de viagens experiente. Ajude os clientes a planejar suas viagens perguntando sobre destinos desejados, orçamento, datas e preferências de hospedagem. Ofereça recomendações de atrações turísticas, restaurantes locais e dicas culturais. Também informe sobre requisitos de visto quando relevante.",
    niche: "Turismo",
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// Função para buscar prompts reais do sistema de prompts
async function fetchUserPrompts(): Promise<Prompt[]> {
  // Como não temos uma tabela de prompts no schema atual, 
  // vamos usar os prompts dos agentes existentes como base
  try {
    const { data: agents } = await supabase
      .from('agents')
      .select('prompt, sector, name, created_at')
      .not('prompt', 'is', null);

    if (agents && agents.length > 0) {
      const userPrompts: Prompt[] = agents.map(agent => ({
        id: uuidv4(),
        name: `Prompt ${agent.name}`,
        text: agent.prompt || '',
        niche: agent.sector || 'Geral',
        createdAt: agent.created_at || new Date().toISOString(),
        isDefault: false
      }));

      return [...DEFAULT_PROMPTS, ...userPrompts];
    }
    
    return DEFAULT_PROMPTS;
  } catch (error) {
    console.error('Erro ao buscar prompts:', error);
    return DEFAULT_PROMPTS;
  }
}

export default function usePromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPromptsLibraryModalOpen, setIsPromptsLibraryModalOpen] = useState(false);
  const [isPromptsManagementModalOpen, setIsPromptsManagementModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [selectedPromptForAgent, setSelectedPromptForAgent] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const loadedPrompts = await fetchUserPrompts();
      setPrompts(loadedPrompts);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      setPrompts(DEFAULT_PROMPTS);
      toast.error('Erro ao carregar prompts, usando prompts padrão');
    } finally {
      setIsLoading(false);
    }
  };

  const createPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    const newPrompt: Prompt = {
      id: uuidv4(),
      ...promptData,
      createdAt: new Date().toISOString(),
    };

    try {
      // Por enquanto, apenas adiciona ao estado local
      // No futuro, seria salvo em uma tabela de prompts
      setPrompts((prev) => [...prev, newPrompt]);
      toast.success(`Prompt "${promptData.name}" criado com sucesso!`);
      return newPrompt;
    } catch (error) {
      console.error('Erro ao criar prompt:', error);
      toast.error('Erro ao criar prompt');
      throw error;
    }
  };

  const updatePrompt = async (id: string, promptData: Partial<Prompt>) => {
    try {
      setPrompts((prev) => 
        prev.map((prompt) => 
          prompt.id === id ? { ...prompt, ...promptData } : prompt
        )
      );
      toast.success(`Prompt "${promptData.name || 'Selecionado'}" atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar prompt:', error);
      toast.error('Erro ao atualizar prompt');
      throw error;
    }
  };

  const deletePrompt = async (id: string) => {
    const promptToDelete = prompts.find(prompt => prompt.id === id);
    if (promptToDelete?.isDefault) {
      toast.error("Não é possível excluir prompts padrão do sistema.");
      return;
    }
    
    try {
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      toast.success("Prompt excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir prompt:', error);
      toast.error('Erro ao excluir prompt');
      throw error;
    }
  };

  const getAllNiches = () => {
    const niches = [...new Set(prompts.map((prompt) => prompt.niche))];
    return niches;
  };

  // Handler functions
  const handleSubmitPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    try {
      if (currentPrompt) {
        await updatePrompt(currentPrompt.id, promptData);
      } else {
        await createPrompt(promptData);
      }
      setIsPromptModalOpen(false);
      setCurrentPrompt(null);
    } catch (error) {
      // Error já tratado nas funções individuais
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPromptForAgent(prompt);
    setIsPromptsLibraryModalOpen(false);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
    setIsPromptModalOpen(true);
  };

  const handleDeletePrompt = async (id: string) => {
    await deletePrompt(id);
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
    isLoading,
    allNiches: getAllNiches(),
    setIsPromptModalOpen,
    setIsPromptsLibraryModalOpen,
    setIsPromptsManagementModalOpen,
    handleSubmitPrompt,
    handleSelectPrompt,
    handleEditPrompt,
    handleDeletePrompt,
    handleCreatePrompt,
    refreshPrompts: loadPrompts,
  };
}