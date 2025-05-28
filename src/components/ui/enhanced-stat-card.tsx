
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
    default: "border-border",
    success: "border-border bg-card",
    warning: "border-border bg-card",
    danger: "border-border bg-card"
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
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
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
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground bg-muted"
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
