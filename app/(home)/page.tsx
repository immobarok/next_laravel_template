import CardsSkeleton from "@/components/skeletons/CardsSkeleton";
import { Suspense } from "react";
import Cards from "./_components/Cards";

const Page = () => {
  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10 bg-linear-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        Our Services
      </h1>
      <Suspense fallback={<CardsSkeleton />}>
        <Cards />
      </Suspense>
    </div>
  );
};

export default Page;
