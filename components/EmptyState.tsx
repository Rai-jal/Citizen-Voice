import React from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      {/* Icon container with better mobile spacing */}
      <View className="bg-gray-100 rounded-full p-8 mb-6">
        {icon}
      </View>
      
      {/* Title with mobile-optimized typography */}
      <Text className="text-xl font-bold text-gray-900 text-center mb-3 px-4">
        {title}
      </Text>
      
      {/* Description with better line height for readability */}
      <Text className="text-base text-gray-600 text-center mb-8 px-6 leading-6 max-w-sm">
        {description}
      </Text>
      
      {/* Action button with full touch target */}
      {actionLabel && onAction && (
        <Button onPress={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

