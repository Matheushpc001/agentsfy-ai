
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 space-y-4",
      className
    )}>
      {icon && (
        <div className="text-muted-foreground/50">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
