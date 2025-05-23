
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Prompt } from "@/types/prompts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, PenLine, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

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

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = activeNiche === "all" || prompt.niche === activeNiche;
    
    return matchesSearch && matchesNiche;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            Biblioteca de Prompts
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon" title="Filtrar por nicho">
              <Filter size={18} />
            </Button>
            <Button onClick={onCreateNew}>Criar Novo</Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche} className="w-full">
          <div className="px-4 py-2 border-b overflow-x-auto">
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs px-3">
                Todos
              </TabsTrigger>
              {niches.map((niche) => (
                <TabsTrigger key={niche} value={niche} className="text-xs px-3">
                  {niche}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <ScrollArea className="h-[50vh] p-4">
            <div className="space-y-3">
              {filteredPrompts.length > 0 ? (
                filteredPrompts.map((prompt) => (
                  <div 
                    key={prompt.id} 
                    className="p-3 border rounded-lg hover:border-primary transition-colors bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{prompt.name}</h3>
                        {prompt.isDefault && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            Padrão
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.text);
                            toast.success("Prompt copiado para a área de transferência");
                          }}
                        >
                          <Copy size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => onEdit(prompt)}
                        >
                          <PenLine size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDelete(prompt.id)}
                          disabled={prompt.isDefault}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Nicho: {prompt.niche}
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-3">{prompt.text}</p>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          onSelect(prompt);
                          onClose();
                        }}
                      >
                        Usar este prompt
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum prompt encontrado</p>
                  <Button onClick={onCreateNew} className="mt-2">
                    Criar novo prompt
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
