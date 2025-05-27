
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "centered" | "wide";
}

export function ResponsiveLayout({ 
  children, 
  className,
  variant = "default"
}: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      "w-full",
      variant === "centered" && "max-w-4xl mx-auto",
      variant === "wide" && "max-w-7xl mx-auto",
      variant === "default" && "max-w-6xl mx-auto",
      "container-padding",
      className
    )}>
      {children}
    </div>
  );
}
