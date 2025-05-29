
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prompt } from "@/types/prompts";

interface PromptTabsProps {
  activeNiche: string;
  onNicheChange: (niche: string) => void;
  prompts: Prompt[];
  allNiches: string[];
  isMobile?: boolean;
}

export default function PromptTabs({ 
  activeNiche, 
  onNicheChange, 
  prompts, 
  allNiches, 
  isMobile 
}: PromptTabsProps) {
  const containerClass = isMobile ? "mb-4 -mx-4 px-4" : "mb-4";
  const maxWidthClass = isMobile ? "max-w-[80px]" : "max-w-[120px]";

  if (isMobile) {
    return (
      <div className={containerClass}>
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full h-auto p-1 bg-muted rounded-md">
            <TabsTrigger 
              value="all" 
              className="text-xs px-3 py-2 whitespace-nowrap font-medium h-8 flex-shrink-0"
            >
              Todos ({prompts.length})
            </TabsTrigger>
            {allNiches.map((niche) => {
              const nicheCount = prompts.filter(p => p.niche === niche).length;
              return (
                <TabsTrigger 
                  key={niche} 
                  value={niche} 
                  className="text-xs px-3 py-2 whitespace-nowrap font-medium h-8 flex-shrink-0"
                >
                  <span className={`${maxWidthClass} truncate`}>
                    {niche}
                  </span>
                  <span className="ml-1">({nicheCount})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="inline-flex w-max h-auto p-1 bg-muted rounded-md">
          <TabsTrigger 
            value="all" 
            className="text-xs px-3 py-2 whitespace-nowrap font-medium h-8"
          >
            Todos ({prompts.length})
          </TabsTrigger>
          {allNiches.map((niche) => {
            const nicheCount = prompts.filter(p => p.niche === niche).length;
            return (
              <TabsTrigger 
                key={niche} 
                value={niche} 
                className="text-xs px-3 py-2 whitespace-nowrap font-medium h-8"
              >
                <span className={`${maxWidthClass} truncate`}>
                  {niche}
                </span>
                <span className="ml-1">({nicheCount})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </ScrollArea>
    </div>
  );
}
