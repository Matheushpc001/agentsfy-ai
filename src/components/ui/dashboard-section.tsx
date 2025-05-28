
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function DashboardSection({ 
  title, 
  description, 
  children, 
  className,
  headerAction 
}: DashboardSectionProps) {
  return (
    <section className={cn(
      "space-y-4 animate-fade-in",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      <div className="animate-slide-in-right">
        {children}
      </div>
    </section>
  );
}
