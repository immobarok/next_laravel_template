import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border rounded-xl">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-[70%]" />
        <Skeleton className="h-3 w-[45%]" />
      </div>
    </div>
  );
}
