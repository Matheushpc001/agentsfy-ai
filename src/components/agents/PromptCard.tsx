
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Sparkles } from "lucide-react";
import { Prompt } from "@/types/prompts";

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (text: string, name: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string, name: string) => void;
  isMobile?: boolean;
}

export default function PromptCard({ prompt, onCopy, onEdit, onDelete, isMobile }: PromptCardProps) {
  const titleClass = isMobile 
    ? "text-sm font-semibold break-words leading-tight min-w-0 flex-1"
    : "text-base font-semibold break-words leading-tight min-w-0 flex-1";
  
  const descriptionClass = isMobile
    ? "text-sm leading-relaxed flex-1 break-words overflow-hidden text-foreground/70 line-clamp-3"
    : "text-sm leading-relaxed flex-1 break-words overflow-hidden text-foreground/70 line-clamp-3";
  
  const headerPadding = isMobile ? "pb-3 flex-shrink-0" : "pb-4 flex-shrink-0";
  const footerPadding = isMobile ? "mt-3 pt-2" : "mt-4 pt-3";

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
      <CardHeader className={headerPadding}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <div className="flex items-start gap-2 flex-wrap">
                <CardTitle className={titleClass}>
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
              onClick={() => onCopy(prompt.text, prompt.name)}
              title="Copiar prompt"
            >
              <Copy size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={() => onEdit(prompt)}
              title="Editar prompt"
            >
              <Edit size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(prompt.id, prompt.name)}
              disabled={prompt.isDefault}
              title={prompt.isDefault ? "Não é possível excluir prompts padrão" : "Excluir prompt"}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-0">
        <CardDescription className={descriptionClass}>
          {prompt.text}
        </CardDescription>
        <div className={`${footerPadding} border-t border-border/30`}>
          <div className="text-xs text-muted-foreground">
            Criado em {new Date(prompt.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
