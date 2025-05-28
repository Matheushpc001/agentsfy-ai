
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatusBadgeProps {
  status: "online" | "offline" | "warning" | "success" | "error" | "info";
  children: ReactNode;
  variant?: "default" | "dot" | "outlined";
  className?: string;
}

export function StatusBadge({ status, children, variant = "default", className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const styles = {
      online: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      offline: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };
    return styles[status as keyof typeof styles] || styles.info;
  };

  const getDotColor = (status: string) => {
    const colors = {
      online: "bg-emerald-500",
      success: "bg-emerald-500",
      offline: "bg-red-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    };
    return colors[status as keyof typeof colors] || colors.info;
  };

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("h-2.5 w-2.5 rounded-full", getDotColor(status))} />
        <span className="text-sm">{children}</span>
      </div>
    );
  }

  if (variant === "outlined") {
    return (
      <span className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full border",
        getStatusStyles(status).replace("bg-", "border-").replace("100", "200"),
        getStatusStyles(status).replace("bg-", "text-").replace("100", "600"),
        "dark:border-opacity-50",
        className
      )}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(
      "text-xs font-medium px-2.5 py-0.5 rounded-full",
      getStatusStyles(status),
      className
    )}>
      {children}
    </span>
  );
}
