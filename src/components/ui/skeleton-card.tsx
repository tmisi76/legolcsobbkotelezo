import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function CarCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 animate-pulse",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      {/* Car Info */}
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Progress */}
      <Skeleton className="h-2 w-full rounded-full mb-4" />

      {/* Anniversary Box */}
      <Skeleton className="h-16 w-full rounded-lg mb-4" />

      {/* Fee Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("text-center", className)}>
      <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-4" />
      <Skeleton className="h-12 w-32 mx-auto mb-2" />
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
  );
}

export function ProfileSectionSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-6", className)}>
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
