
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Plus, FileText } from "lucide-react";
import { Prompt } from "@/types/prompts";
import PromptCard from "./PromptCard";

interface PromptListProps {
  activeNiche: string;
  filteredPrompts: Prompt[];
  searchTerm: string;
  onCreatePrompt: () => void;
  onCopyPrompt: (text: string, name: string) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (id: string, name: string) => void;
  isMobile?: boolean;
}

export default function PromptList({
  activeNiche,
  filteredPrompts,
  searchTerm,
  onCreatePrompt,
  onCopyPrompt,
  onEditPrompt,
  onDeletePrompt,
  isMobile
}: PromptListProps) {
  const gridClass = isMobile ? "space-y-3 pb-6" : "grid gap-3 grid-cols-1";

  if (filteredPrompts.length > 0) {
    return (
      <TabsContent value={activeNiche} className="mt-0">
        <div className={gridClass}>
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={onCopyPrompt}
              onEdit={onEditPrompt}
              onDelete={onDeletePrompt}
              isMobile={isMobile}
            />
          ))}
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value={activeNiche}>
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
    </TabsContent>
  );
}
