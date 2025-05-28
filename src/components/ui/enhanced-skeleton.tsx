
import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function EnhancedSkeleton({
  className,
  variant = "default",
  width,
  height,
  style,
  ...props
}: EnhancedSkeletonProps) {
  const variantStyles = {
    default: "rounded-lg",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted/60 via-muted/80 to-muted/60",
        "bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style
      }}
      {...props}
    />
  );
}

export { EnhancedSkeleton };
