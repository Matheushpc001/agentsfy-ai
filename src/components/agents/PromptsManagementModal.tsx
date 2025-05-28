
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Prompt } from "@/types/prompts";
import { useIsMobile } from "@/hooks/use-mobile";

interface PromptsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onCreatePrompt: () => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (id: string) => void;
  allNiches: string[];
}

export default function PromptsManagementModal({
  isOpen,
  onClose,
  prompts,
  onCreatePrompt,
  onEditPrompt,
  onDeletePrompt,
  allNiches
}: PromptsManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNiche, setActiveNiche] = useState<string>("all");
  const isMobile = useIsMobile();

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
    onDeletePrompt(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-[95vw] h-[90vh] max-w-none' : 'w-full max-w-6xl h-[85vh]'} 
        p-0 overflow-hidden
      `}>
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Biblioteca de Prompts
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie prompts personalizados para seus agentes IA
            </p>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {/* Stats Cards */}
            <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Total de Prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {prompts.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300">
                      Nichos Disponíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg font-bold text-green-900 dark:text-green-100">
                      {allNiches.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Prompts Padrão
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {prompts.filter(p => p.isDefault).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base h-10 bg-background border-input"
                  />
                </div>
                <Button onClick={onCreatePrompt} className="sm:w-auto w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Prompt
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1 mt-3">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span>Filtrar por nicho:</span>
              </div>
            </div>

            {/* Tabs and Content */}
            <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-3 border-b flex-shrink-0">
                <ScrollArea className="w-full">
                  <div className="pb-2">
                    <TabsList className="inline-flex h-10 p-1 bg-muted rounded-md">
                      <TabsTrigger 
                        value="all" 
                        className="text-sm px-3 py-2 whitespace-nowrap flex-shrink-0 font-medium"
                      >
                        Todos ({prompts.length})
                      </TabsTrigger>
                      {allNiches.map((niche) => {
                        const nicheCount = prompts.filter(p => p.niche === niche).length;
                        return (
                          <TabsTrigger 
                            key={niche} 
                            value={niche} 
                            className="text-sm px-3 py-2 whitespace-nowrap flex-shrink-0 font-medium"
                          >
                            <span className="max-w-[120px] truncate">
                              {niche}
                            </span>
                            <span className="ml-1">({nicheCount})</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value={activeNiche} className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <ScrollArea className="flex-1">
                    <div className="px-6 py-4">
                      {filteredPrompts.length > 0 ? (
                        <div className={`
                          grid gap-4 
                          ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}
                        `}>
                          {filteredPrompts.map((prompt) => (
                            <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col border-border/50">
                              <CardHeader className="pb-4 flex-shrink-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="space-y-3">
                                      <div className="flex items-start gap-3 flex-wrap">
                                        <CardTitle className="text-base font-semibold break-words leading-tight min-w-0 flex-1">
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
                                      onClick={() => onEditPrompt(prompt)}
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
                                  ${isMobile ? 'line-clamp-4' : 'line-clamp-3'}
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
                            onClick={onCreatePrompt} 
                            variant="outline" 
                            size="default"
                            className="px-6 py-3 h-11"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar novo prompt
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
