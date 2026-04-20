const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Image */}
      <div className="w-full h-48 shimmer" />

      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-5/6 rounded shimmer" />

        <div className="h-10 w-full rounded-lg shimmer mt-4" />
      </div>
    </div>
  );
};

export default CardSkeleton;
