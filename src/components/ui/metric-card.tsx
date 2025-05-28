
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
    label?: string;
  };
  variant?: "default" | "compact" | "highlighted";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = "default", 
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md",
      variant === "highlighted" && "border-primary/20 shadow-sm",
      variant === "compact" && "p-0",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between pb-2 space-y-0",
        variant === "compact" && "p-4 pb-2"
      )}>
        <CardTitle className={cn(
          "text-sm font-medium text-muted-foreground",
          variant === "highlighted" && "text-primary/80"
        )}>
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "text-muted-foreground",
            variant === "highlighted" && "text-primary"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(variant === "compact" && "p-4 pt-0")}>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold tracking-tight",
            variant === "highlighted" && "text-primary"
          )}>
            {value}
          </div>
          
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 text-xs">
              {trend && (
                <span className={cn(
                  "inline-flex items-center font-medium",
                  trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  <span className="mr-1">
                    {trend.positive ? "↗" : "↘"}
                  </span>
                  {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span className="text-muted-foreground">
                  {subtitle}
                </span>
              )}
              {trend?.label && (
                <span className="text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
