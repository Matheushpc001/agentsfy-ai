
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
    default: "border-gray-200/80 bg-white/95 hover:bg-gray-50/90 dark:border-gray-700/60 dark:bg-gray-800/90 dark:hover:bg-gray-800/95 backdrop-blur-sm shadow-sm hover:shadow-md",
    success: "border-green-200/80 bg-green-50/90 hover:bg-green-50/95 dark:border-green-800/60 dark:bg-green-950/70 dark:hover:bg-green-950/80 backdrop-blur-sm shadow-sm hover:shadow-md",
    warning: "border-yellow-200/80 bg-yellow-50/90 hover:bg-yellow-50/95 dark:border-yellow-800/60 dark:bg-yellow-950/70 dark:hover:bg-yellow-950/80 backdrop-blur-sm shadow-sm hover:shadow-md",
    danger: "border-red-200/80 bg-red-50/90 hover:bg-red-50/95 dark:border-red-800/60 dark:bg-red-950/70 dark:hover:bg-red-950/80 backdrop-blur-sm shadow-sm hover:shadow-md"
  };

  const iconVariantStyles = {
    default: "bg-blue-100/80 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400",
    success: "bg-green-100/80 text-green-600 dark:bg-green-900/60 dark:text-green-400",
    warning: "bg-yellow-100/80 text-yellow-600 dark:bg-yellow-900/60 dark:text-yellow-400",
    danger: "bg-red-100/80 text-red-600 dark:bg-red-900/60 dark:text-red-400"
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98]",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0 p-4 sm:p-6 sm:pb-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-none truncate">
            {title}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "p-2 sm:p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
            iconVariantStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          <div className="text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-200">
            {value}
          </div>
          
          <div className="flex items-center gap-2 text-xs min-h-[20px]">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium px-2 sm:px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 text-xs",
                  trend.positive 
                    ? "text-green-700 bg-green-100/80 hover:bg-green-200/80 dark:text-green-400 dark:bg-green-900/60 dark:hover:bg-green-900/80" 
                    : "text-red-700 bg-red-100/80 hover:bg-red-200/80 dark:text-red-400 dark:bg-red-900/60 dark:hover:bg-red-900/80"
                )}
              >
                <span className="text-xs font-semibold">
                  {trend.positive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-gray-600 dark:text-gray-300 font-medium truncate">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
