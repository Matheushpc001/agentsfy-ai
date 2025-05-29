
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

interface PromptSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreatePrompt: () => void;
  isMobile?: boolean;
}

export default function PromptSearchAndActions({ 
  searchTerm, 
  onSearchChange, 
  onCreatePrompt, 
  isMobile 
}: PromptSearchAndActionsProps) {
  const inputHeight = isMobile ? "h-12" : "h-10";
  const buttonHeight = isMobile ? "h-12" : "";
  const inputClass = isMobile 
    ? `pl-10 ${inputHeight} text-base` 
    : `pl-10 bg-background border-input ${inputHeight} text-base`;

  return (
    <div className="space-y-3">
      <div className={isMobile ? "space-y-3" : "flex flex-col gap-3"}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button onClick={onCreatePrompt} className={`w-full ${buttonHeight}`}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Prompt
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4 flex-shrink-0" />
        <span>Filtrar por nicho:</span>
      </div>
    </div>
  );
}
