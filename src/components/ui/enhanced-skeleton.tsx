
import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
}

export function EnhancedSkeleton({ 
  className, 
  variant = "default" 
}: EnhancedSkeletonProps) {
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-4 w-3/4",
    circle: "h-12 w-12 rounded-full"
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg",
        "bg-gradient-to-r from-muted via-muted/70 to-muted",
        "bg-[length:200%_100%]",
        "animate-[shimmer_2s_ease-in-out_infinite]",
        variants[variant],
        className
      )}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border bg-card space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton variant="text" className="w-24 h-3" />
        </div>
        <EnhancedSkeleton variant="circle" className="h-10 w-10" />
      </div>
      <div className="space-y-3">
        <EnhancedSkeleton className="h-8 w-20" />
        <div className="flex items-center gap-2">
          <EnhancedSkeleton className="h-6 w-12 rounded-full" />
          <EnhancedSkeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
