
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prompt } from "@/types/prompts";

interface PromptStatsCardsProps {
  prompts: Prompt[];
  allNiches: string[];
  isMobile?: boolean;
}

export default function PromptStatsCards({ prompts, allNiches, isMobile }: PromptStatsCardsProps) {
  const cardClass = isMobile 
    ? "bg-gradient-to-br border-200 dark:border-800/30"
    : "bg-gradient-to-br border-200 dark:border-800/30";
  
  const headerClass = isMobile ? "pb-1 px-3 pt-3" : "pb-1";
  const contentClass = isMobile ? "pt-0 px-3 pb-3" : "pt-0";
  const titleClass = "text-xs font-medium";
  const valueClass = "text-lg font-bold";

  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className={`${cardClass} from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30`}>
        <CardHeader className={headerClass}>
          <CardTitle className={`${titleClass} text-blue-700 dark:text-blue-300`}>
            Total
          </CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          <div className={`${valueClass} text-blue-900 dark:text-blue-100`}>
            {prompts.length}
          </div>
        </CardContent>
      </Card>

      <Card className={`${cardClass} from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30`}>
        <CardHeader className={headerClass}>
          <CardTitle className={`${titleClass} text-green-700 dark:text-green-300`}>
            Nichos
          </CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          <div className={`${valueClass} text-green-900 dark:text-green-100`}>
            {allNiches.length}
          </div>
        </CardContent>
      </Card>

      <Card className={`${cardClass} from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30`}>
        <CardHeader className={headerClass}>
          <CardTitle className={`${titleClass} text-purple-700 dark:text-purple-300`}>
            Padrão
          </CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          <div className={`${valueClass} text-purple-900 dark:text-purple-100`}>
            {prompts.filter(p => p.isDefault).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
