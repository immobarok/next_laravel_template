import { Skeleton } from "../ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl space-y-3">
      <Skeleton className="h-3 w-[40%]" />
      <Skeleton className="h-7 w-[55%]" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
