
import { ReactNode } from "react";
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

export function EnhancedStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  variant = "default"
}: EnhancedStatCardProps) {
  const variantStyles = {
    default: "border-border bg-card",
    success: "border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-950/80",
    warning: "border-yellow-200 bg-yellow-50/80 dark:border-yellow-800 dark:bg-yellow-950/80",
    danger: "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/80"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md hover:-translate-y-1",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground leading-none">
            {title}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === "success" && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
            variant === "warning" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
            variant === "danger" && "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
            variant === "default" && "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium px-2 py-1 rounded-full",
                  trend.positive 
                    ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/50" 
                    : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"
                )}
              >
                <span className="text-xs">
                  {trend.positive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
