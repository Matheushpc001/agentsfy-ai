
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
import { useIsMobile } from "@/hooks/use-mobile";

export default function Prompts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNiche, setActiveNiche] = useState<string>("all");
  const isMobile = useIsMobile();
  
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
    toast.success(`Prompt "${name}" copiado!`);
  };

  const handleDeletePrompt = (id: string, name: string) => {
    deletePrompt(id);
  };

  return (
    <DashboardLayout title="Prompts">
      <div className="w-full max-w-full overflow-hidden">
        <div className="space-y-4 sm:space-y-6">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0 self-start">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  Biblioteca de Prompts
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                  Gerencie prompts personalizados para seus agentes IA
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button 
                  onClick={() => setIsPromptModalOpen(true)} 
                  className="w-full sm:w-auto text-sm px-4 py-3 h-11 font-medium"
                  size="default"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Novo Prompt</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total de Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
              <CardContent className="pt-0">
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
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {prompts.filter(p => p.isDefault).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter - Mobile Enhanced */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base h-12 bg-background border-input"
              />
            </div>
            
            {/* Filter Label - Better spacing on mobile */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span>Filtrar por nicho:</span>
            </div>
          </div>

          {/* Tabs for Niches - Mobile Optimized */}
          <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche}>
            <div className="w-full">
              <ScrollArea className="w-full">
                <div className="pb-3">
                  <TabsList className={`
                    ${isMobile ? 'flex w-max h-auto p-1 gap-1' : 'inline-flex h-10 p-1'} 
                    bg-muted rounded-md
                  `}>
                    <TabsTrigger 
                      value="all" 
                      className={`
                        ${isMobile ? 'text-sm px-4 py-3 h-auto' : 'text-sm px-3 py-2'}
                        whitespace-nowrap flex-shrink-0 font-medium
                      `}
                    >
                      Todos ({prompts.length})
                    </TabsTrigger>
                    {niches.map((niche) => {
                      const nicheCount = prompts.filter(p => p.niche === niche).length;
                      return (
                        <TabsTrigger 
                          key={niche} 
                          value={niche} 
                          className={`
                            ${isMobile ? 'text-sm px-4 py-3 h-auto' : 'text-sm px-3 py-2'}
                            whitespace-nowrap flex-shrink-0 font-medium
                          `}
                        >
                          <span className={`${isMobile ? 'max-w-[100px]' : 'max-w-[80px]'} truncate`}>
                            {niche}
                          </span>
                          <span className="ml-1.5">({nicheCount})</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </ScrollArea>
            </div>

            <TabsContent value={activeNiche} className="mt-6">
              {filteredPrompts.length > 0 ? (
                <div className={`
                  grid gap-4 
                  ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}
                `}>
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col border-border/50">
                      <CardHeader className="pb-4 flex-shrink-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 flex-wrap">
                                <CardTitle className="text-base sm:text-lg font-semibold break-words leading-tight min-w-0 flex-1">
                                  {prompt.name}
                                </CardTitle>
                                {prompt.isDefault && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs flex-shrink-0">
                                    <Sparkles className="mr-1.5 h-3 w-3" />
                                    <span>Padrão</span>
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs w-fit font-medium">
                                {prompt.niche}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Action buttons - Mobile enhanced */}
                          <div className={`
                            flex items-center gap-1 flex-shrink-0
                            ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            transition-opacity duration-200
                          `}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={() => handleCopyPrompt(prompt.text, prompt.name)}
                              title="Copiar prompt"
                            >
                              <Copy size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-muted"
                              onClick={() => openEditPromptModal(prompt)}
                              title="Editar prompt"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeletePrompt(prompt.id, prompt.name)}
                              disabled={prompt.isDefault}
                              title={prompt.isDefault ? "Não é possível excluir prompts padrão" : "Excluir prompt"}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col pt-0">
                        <CardDescription className={`
                          text-sm leading-relaxed flex-1 break-words overflow-hidden text-foreground/70
                          ${isMobile ? 'line-clamp-6' : 'line-clamp-4'}
                        `}>
                          {prompt.text}
                        </CardDescription>
                        <div className="mt-4 pt-3 border-t border-border/30">
                          <div className="text-xs text-muted-foreground">
                            Criado em {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Nenhum prompt encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    {searchTerm ? 
                      "Tente ajustar os filtros ou termos de busca para encontrar o que procura" : 
                      "Comece criando seu primeiro prompt personalizado para seus agentes IA"
                    }
                  </p>
                  <Button 
                    onClick={() => setIsPromptModalOpen(true)} 
                    variant="outline" 
                    size="default"
                    className="px-6 py-3 h-11"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar novo prompt
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
