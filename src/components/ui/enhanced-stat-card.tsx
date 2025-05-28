
import { ReactNode, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export const EnhancedStatCard = memo(function EnhancedStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  variant = "default"
}: EnhancedStatCardProps) {
  const variantStyles = {
    default: "border-border bg-card hover:bg-accent/5",
    success: "border-green-200 bg-green-50/80 hover:bg-green-50 dark:border-green-800 dark:bg-green-950/80 dark:hover:bg-green-950/90",
    warning: "border-yellow-200 bg-yellow-50/80 hover:bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/80 dark:hover:bg-yellow-950/90",
    danger: "border-red-200 bg-red-50/80 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/80 dark:hover:bg-red-950/90"
  };

  const iconVariantStyles = {
    default: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    success: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    danger: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 active:scale-[0.98]",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground leading-none truncate">
            {title}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
            iconVariantStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-2xl font-bold tracking-tight transition-colors duration-200">
            {value}
          </div>
          
          <div className="flex items-center gap-2 text-xs min-h-[20px]">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105",
                  trend.positive 
                    ? "text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/50 dark:hover:bg-green-900/70" 
                    : "text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-900/70"
                )}
              >
                <span className="text-xs font-semibold">
                  {trend.positive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-muted-foreground font-medium">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
