// components/ui/MotionSkeleton.jsx
"use client";

import { motion } from "framer-motion";

type MotionSkeletonProps = {
  className?: string;
};

const MotionSkeleton = ({ className = "" }: MotionSkeletonProps) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      {/* Shimmer layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
        }}
      />
    </div>
  );
};

export default MotionSkeleton;
