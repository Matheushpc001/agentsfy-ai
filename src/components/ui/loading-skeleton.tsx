
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "stat" | "list" | "table";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "card", count = 1, className }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "stat":
        return (
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        );
      
      case "list":
        return (
          <div className="p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-4 p-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
