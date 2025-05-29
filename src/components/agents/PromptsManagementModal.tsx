
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
        ${isMobile 
          ? 'w-[100vw] h-[100vh] max-w-none max-h-none m-0 rounded-none border-0' 
          : 'w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-lg'
        } 
        p-0 overflow-hidden
      `}>
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className={`flex-shrink-0 border-b bg-background ${isMobile ? 'px-3 py-3' : 'px-6 py-4'}`}>
            <DialogHeader>
              <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold flex items-center gap-2`}>
                <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                Biblioteca de Prompts
              </DialogTitle>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                Gerencie prompts personalizados para seus agentes IA
              </p>
            </DialogHeader>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 pb-6">
                {/* Stats Cards */}
                <div className={`bg-muted/20 ${isMobile ? 'px-3 py-3' : 'px-6 py-4'}`}>
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
                      <CardHeader className="pb-1">
                        <CardTitle className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-blue-700 dark:text-blue-300`}>
                          Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-blue-900 dark:text-blue-100`}>
                          {prompts.length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
                      <CardHeader className="pb-1">
                        <CardTitle className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-green-700 dark:text-green-300`}>
                          Nichos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-green-900 dark:text-green-100`}>
                          {allNiches.length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30">
                      <CardHeader className="pb-1">
                        <CardTitle className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-purple-700 dark:text-purple-300`}>
                          Padrão
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-purple-900 dark:text-purple-100`}>
                          {prompts.filter(p => p.isDefault).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Search and Actions */}
                <div className={`space-y-3 ${isMobile ? 'px-3' : 'px-6'}`}>
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        placeholder="Buscar prompts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-10 bg-background border-input ${isMobile ? 'h-10 text-base' : 'h-10 text-base'}`}
                      />
                    </div>
                    <Button onClick={onCreatePrompt} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Prompt
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4 flex-shrink-0" />
                    <span>Filtrar por nicho:</span>
                  </div>
                </div>

                {/* Tabs and Content */}
                <div className={`${isMobile ? 'px-3' : 'px-6'}`}>
                  <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche}>
                    {/* Tabs Navigation */}
                    <div className="mb-4">
                      <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="inline-flex w-max h-auto p-1 bg-muted rounded-md">
                          <TabsTrigger 
                            value="all" 
                            className={`text-xs px-3 py-2 whitespace-nowrap font-medium ${isMobile ? 'h-8' : 'h-8'}`}
                          >
                            Todos ({prompts.length})
                          </TabsTrigger>
                          {allNiches.map((niche) => {
                            const nicheCount = prompts.filter(p => p.niche === niche).length;
                            return (
                              <TabsTrigger 
                                key={niche} 
                                value={niche} 
                                className={`text-xs px-3 py-2 whitespace-nowrap font-medium ${isMobile ? 'h-8' : 'h-8'}`}
                              >
                                <span className={`${isMobile ? 'max-w-[80px]' : 'max-w-[120px]'} truncate`}>
                                  {niche}
                                </span>
                                <span className="ml-1">({nicheCount})</span>
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>
                      </ScrollArea>
                    </div>

                    {/* Tabs Content */}
                    <TabsContent value={activeNiche}>
                      {filteredPrompts.length > 0 ? (
                        <div className="grid gap-3 grid-cols-1">
                          {filteredPrompts.map((prompt) => (
                            <Card key={prompt.id} className="group hover:shadow-md transition-all duration-200 border-border/50">
                              <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'} flex-shrink-0`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2 flex-wrap">
                                        <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold break-words leading-tight min-w-0 flex-1`}>
                                          {prompt.name}
                                        </CardTitle>
                                        {prompt.isDefault && (
                                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs flex-shrink-0">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            <span>Padrão</span>
                                          </Badge>
                                        )}
                                      </div>
                                      <Badge variant="outline" className="text-xs w-fit font-medium">
                                        {prompt.niche}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 flex-shrink-0">
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
                                  ${isMobile ? 'line-clamp-3' : 'line-clamp-3'}
                                `}>
                                  {prompt.text}
                                </CardDescription>
                                <div className={`${isMobile ? 'mt-3 pt-2' : 'mt-4 pt-3'} border-t border-border/30`}>
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
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
