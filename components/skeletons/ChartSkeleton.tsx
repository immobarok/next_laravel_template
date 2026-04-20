import { Skeleton } from "../ui/skeleton";

export function ChartSkeleton() {
  const heights = [40, 70, 55, 90, 60, 75, 45];
  return (
    <div className="p-4 border rounded-xl">
      <Skeleton className="h-3 w-[35%] mb-5" />
      <div className="flex items-end gap-2 h-24">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm rounded-b-none"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
