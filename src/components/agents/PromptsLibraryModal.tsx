
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Prompt } from "@/types/prompts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, PenLine, Filter, Search, Plus, Zap } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PromptsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  niches: string[];
}

export default function PromptsLibraryModal({
  isOpen,
  onClose,
  prompts,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew,
  niches
}: PromptsLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNiche, setActiveNiche] = useState<string>("all");
  const isMobile = useIsMobile();

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = activeNiche === "all" || prompt.niche === activeNiche;
    
    return matchesSearch && matchesNiche;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-[95vw] h-[90vh] max-w-none' : 'w-full max-w-4xl h-[85vh]'} 
        p-0 flex flex-col max-h-[90vh]
      `}>
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Biblioteca de Prompts
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie e selecione prompts para seus agentes
          </p>
        </DialogHeader>
        
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts por nome ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={onCreateNew} className="sm:w-auto w-full">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b flex-shrink-0">
            <TabsList className={`
              ${isMobile ? 'flex-wrap h-auto gap-1 p-1' : 'h-10'}
              w-full justify-start
            `}>
              <TabsTrigger value="all" className={`
                ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-4 py-2'}
                flex-shrink-0
              `}>
                Todos ({prompts.length})
              </TabsTrigger>
              {niches.map((niche) => {
                const nicheCount = prompts.filter(p => p.niche === niche).length;
                return (
                  <TabsTrigger 
                    key={niche} 
                    value={niche} 
                    className={`
                      ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-4 py-2'}
                      flex-shrink-0
                    `}
                  >
                    {niche} ({nicheCount})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                  {filteredPrompts.length > 0 ? (
                    filteredPrompts.map((prompt) => (
                      <div 
                        key={prompt.id} 
                        className="group p-4 border rounded-lg hover:border-primary/50 transition-all duration-200 bg-card hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base truncate">{prompt.name}</h3>
                              {prompt.isDefault && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded inline-block">
                              Nicho: {prompt.niche}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 opacity-60 hover:opacity-100" 
                              onClick={() => {
                                navigator.clipboard.writeText(prompt.text);
                                toast.success("Prompt copiado!");
                              }}
                              title="Copiar prompt"
                            >
                              <Copy size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                              onClick={() => onEdit(prompt)}
                              title="Editar prompt"
                            >
                              <PenLine size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-primary hover:text-primary opacity-60 hover:opacity-100"
                              onClick={() => {
                                onSelect(prompt);
                                onClose();
                              }}
                              title="Usar este prompt para criar agente"
                            >
                              <Zap size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-foreground/80 line-clamp-4 leading-relaxed">
                            {prompt.text}
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              onSelect(prompt);
                              onClose();
                            }}
                            className="group-hover:scale-105 transition-transform duration-200"
                          >
                            Usar este prompt
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Nenhum prompt encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm ? 
                            "Tente ajustar os filtros ou termos de busca" : 
                            "Comece criando seu primeiro prompt personalizado"
                          }
                        </p>
                        <Button onClick={onCreateNew} variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Criar novo prompt
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
