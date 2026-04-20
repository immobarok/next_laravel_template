import { Skeleton } from "../ui/skeleton";

export function MediaCardSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-3 w-[60%]" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 flex-1" />
        </div>
      </div>
    </div>
  );
}
