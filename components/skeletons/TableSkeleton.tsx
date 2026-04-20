import { Skeleton } from "../ui/skeleton";

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex gap-4 p-3 border-b">
        <Skeleton className="h-3 flex-2" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 border-b last:border-0"
        >
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <Skeleton className="h-3 flex-2" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
  );
}
