
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "loading" | "error";
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      color: "bg-green-500",
      label: label || "Online"
    },
    offline: {
      color: "bg-gray-400",
      label: label || "Offline"
    },
    loading: {
      color: "bg-yellow-500 animate-pulse",
      label: label || "Carregando"
    },
    error: {
      color: "bg-red-500",
      label: label || "Erro"
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      {label !== undefined && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
