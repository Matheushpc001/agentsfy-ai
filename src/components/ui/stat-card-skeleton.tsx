
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <EnhancedSkeleton variant="text" width="60%" />
        <EnhancedSkeleton variant="circular" width={20} height={20} />
      </CardHeader>
      <CardContent className="space-y-3">
        <EnhancedSkeleton variant="text" width="40%" height={32} className="rounded" />
        <div className="flex items-center space-x-2">
          <EnhancedSkeleton variant="text" width="30%" />
          <EnhancedSkeleton variant="text" width="50%" />
        </div>
      </CardContent>
    </Card>
  );
}
