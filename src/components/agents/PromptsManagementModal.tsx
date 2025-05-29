
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Prompt } from "@/types/prompts";
import { useIsMobile } from "@/hooks/use-mobile";
import PromptStatsCards from "./PromptStatsCards";
import PromptSearchAndActions from "./PromptSearchAndActions";
import PromptTabs from "./PromptTabs";
import PromptList from "./PromptList";

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

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-0 flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Biblioteca de Prompts
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie prompts personalizados para seus agentes IA
              </p>
            </DialogHeader>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-4 space-y-4">
                {/* Stats Cards */}
                <PromptStatsCards 
                  prompts={prompts} 
                  allNiches={allNiches} 
                  isMobile={isMobile} 
                />

                {/* Search and Actions */}
                <PromptSearchAndActions
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onCreatePrompt={onCreatePrompt}
                  isMobile={isMobile}
                />

                {/* Tabs */}
                <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche}>
                  <PromptTabs
                    activeNiche={activeNiche}
                    onNicheChange={setActiveNiche}
                    prompts={prompts}
                    allNiches={allNiches}
                    isMobile={isMobile}
                  />

                  <PromptList
                    activeNiche={activeNiche}
                    filteredPrompts={filteredPrompts}
                    searchTerm={searchTerm}
                    onCreatePrompt={onCreatePrompt}
                    onCopyPrompt={handleCopyPrompt}
                    onEditPrompt={onEditPrompt}
                    onDeletePrompt={handleDeletePrompt}
                    isMobile={isMobile}
                  />
                </Tabs>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-lg p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 border-b bg-background px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Biblioteca de Prompts
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie prompts personalizados para seus agentes IA
              </p>
            </DialogHeader>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 pb-6">
                {/* Stats Cards */}
                <div className="bg-muted/20 px-6 py-4">
                  <PromptStatsCards 
                    prompts={prompts} 
                    allNiches={allNiches} 
                    isMobile={isMobile} 
                  />
                </div>

                {/* Search and Actions */}
                <div className="px-6">
                  <PromptSearchAndActions
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCreatePrompt={onCreatePrompt}
                    isMobile={isMobile}
                  />
                </div>

                {/* Tabs and Content */}
                <div className="px-6">
                  <Tabs defaultValue="all" value={activeNiche} onValueChange={setActiveNiche}>
                    <PromptTabs
                      activeNiche={activeNiche}
                      onNicheChange={setActiveNiche}
                      prompts={prompts}
                      allNiches={allNiches}
                      isMobile={isMobile}
                    />

                    <PromptList
                      activeNiche={activeNiche}
                      filteredPrompts={filteredPrompts}
                      searchTerm={searchTerm}
                      onCreatePrompt={onCreatePrompt}
                      onCopyPrompt={handleCopyPrompt}
                      onEditPrompt={onEditPrompt}
                      onDeletePrompt={handleDeletePrompt}
                      isMobile={isMobile}
                    />
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
