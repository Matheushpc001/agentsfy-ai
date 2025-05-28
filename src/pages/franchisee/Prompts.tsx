
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  FileText,
  Sparkles,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import usePromptManagement from "@/hooks/usePromptManagement";
import PromptModal from "@/components/agents/PromptModal";
import PromptsLibraryModal from "@/components/agents/PromptsLibraryModal";

export default function Prompts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNiche, setActiveNiche] = useState<string>("all");
  
  const {
    prompts,
    isPromptModalOpen,
    setIsPromptModalOpen,
    createPrompt,
    updatePrompt,
    deletePrompt,
    openEditPromptModal,
    isEditPromptModalOpen,
    setIsEditPromptModalOpen,
    currentPrompt,
    getAllNiches
  } = usePromptManagement();

  const niches = getAllNiches();

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = activeNiche === "all" || prompt.niche === activeNiche;
    
    return matchesSearch && matchesNiche;
  });

  const handleCopyPrompt = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Prompt "${name}" copiado para a área de transferência!`);
  };

  const handleDeletePrompt = (id: string, name: string) => {
    deletePrompt(id);
  };

  return (
    <DashboardLayout title="Prompts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Biblioteca de Prompts</h1>
                <p className="text-muted-foreground">
                  Gerencie prompts personalizados para seus agentes IA
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setIsPromptModalOpen(true)} className="flex-1 md:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              Novo Prompt
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total de Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {prompts.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Nichos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {niches.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Prompts Padrão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {prompts.filter(p => p.isDefault).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prompts por nome ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtrar por nicho:</span>
          </div>
        </div>

        {/* Tabs for Niches */}
        <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
            <TabsTrigger value="all" className="text-xs">
              Todos ({prompts.length})
            </TabsTrigger>
            {niches.slice(0, 5).map((niche) => {
              const nicheCount = prompts.filter(p => p.niche === niche).length;
              return (
                <TabsTrigger key={niche} value={niche} className="text-xs">
                  {niche} ({nicheCount})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeNiche} className="mt-6">
            {filteredPrompts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="group hover:shadow-md transition-all duration-200 hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base truncate">
                              {prompt.name}
                            </CardTitle>
                            {prompt.isDefault && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Padrão
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {prompt.niche}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleCopyPrompt(prompt.text, prompt.name)}
                            title="Copiar prompt"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => openEditPromptModal(prompt)}
                            title="Editar prompt"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePrompt(prompt.id, prompt.name)}
                            disabled={prompt.isDefault}
                            title={prompt.isDefault ? "Não é possível excluir prompts padrão" : "Excluir prompt"}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-4 text-sm leading-relaxed">
                        {prompt.text}
                      </CardDescription>
                      <div className="mt-4 text-xs text-muted-foreground">
                        Criado em {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum prompt encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 
                    "Tente ajustar os filtros ou termos de busca" : 
                    "Comece criando seu primeiro prompt personalizado"
                  }
                </p>
                <Button onClick={() => setIsPromptModalOpen(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar novo prompt
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={createPrompt}
        allNiches={niches}
      />

      <PromptModal
        isOpen={isEditPromptModalOpen}
        onClose={() => setIsEditPromptModalOpen(false)}
        onSubmit={(data) => currentPrompt && updatePrompt(currentPrompt.id, data)}
        editing={currentPrompt}
        allNiches={niches}
      />
    </DashboardLayout>
  );
}
