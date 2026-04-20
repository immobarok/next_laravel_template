// components/CardsSkeleton.jsx
import CardSkeleton from "./CardSkeleton";

const CardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 0.1}s` }}
          className="animate-fade-in"
        >
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default CardsSkeleton;
