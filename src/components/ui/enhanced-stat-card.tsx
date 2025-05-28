
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function EnhancedStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className 
}: EnhancedStatCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-primary transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-primary">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center text-xs mt-1 space-x-1">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-medium transition-all duration-300",
                  trend.positive 
                    ? "text-emerald-500 group-hover:text-emerald-600" 
                    : "text-rose-500 group-hover:text-rose-600"
                )}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {trend.positive ? "↑" : "↓"}
                </span>
                <span className="ml-0.5">{Math.abs(trend.value)}%</span>
              </span>
            )}
            {description && (
              <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
