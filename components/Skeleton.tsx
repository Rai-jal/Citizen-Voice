import React from "react";
import { View } from "react-native";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  radius?: number;
  className?: string;
  style?: object;
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 12,
  className = "",
  style = {},
}: SkeletonProps) {
  return (
    <View
      className={`bg-gray-200 ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        opacity: 0.8,
        ...style,
      }}
    />
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, idx) => (
        <View
          key={idx}
          className="bg-white rounded-xl p-4 mb-4 border border-gray-100"
        >
          <Skeleton height={18} className="mb-2" />
          <Skeleton height={14} width="80%" className="mb-2" />
          <Skeleton height={12} width="60%" />
        </View>
      ))}
    </View>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="flex-row">
      {Array.from({ length: count }).map((_, idx) => (
        <View
          key={idx}
          className="bg-white rounded-2xl mr-3 border border-gray-200"
          style={{ width: 140, height: 140, padding: 12 }}
        >
          <Skeleton height={56} className="mb-3" />
          <Skeleton height={14} width="70%" className="mb-2" />
          <Skeleton height={12} width="50%" />
        </View>
      ))}
    </View>
  );
}


