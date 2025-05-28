
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
        "animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        "bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        variants[variant],
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <EnhancedSkeleton variant="text" className="w-24" />
        <EnhancedSkeleton variant="circle" className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton className="h-8 w-20" />
        <EnhancedSkeleton className="h-3 w-16" />
      </div>
      <EnhancedSkeleton className="h-4 w-12" />
    </div>
  );
}
