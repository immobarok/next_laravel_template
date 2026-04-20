import { Skeleton } from "../ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-5">
      {[30, 25, 35].map((w, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className={`h-3 w-[${w}%]`} />
          <Skeleton
            className={`h-9 w-full rounded-md ${i === 2 ? "h-20" : ""}`}
          />
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}
