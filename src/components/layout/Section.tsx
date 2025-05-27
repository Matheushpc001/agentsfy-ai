
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  spacing?: "sm" | "md" | "lg";
}

export function Section({ 
  children, 
  className,
  title,
  description,
  spacing = "md"
}: SectionProps) {
  const spacingClasses = {
    sm: "space-y-4",
    md: "space-y-6",
    lg: "space-y-8"
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
