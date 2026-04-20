import { Skeleton } from "../ui/skeleton";

export function NotificationSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-[50%]" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-[75%]" />
            <Skeleton className="h-2.5 w-[25%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
