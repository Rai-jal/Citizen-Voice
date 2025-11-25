import React from "react";
import { Text, View, ViewProps } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const textColors = {
    default: "text-gray-800",
    success: "text-green-800",
    warning: "text-yellow-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  return (
    <View
      className={`
        inline-flex items-center justify-center rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      <Text className={`font-medium ${textColors[variant]}`}>
        {children}
      </Text>
    </View>
  );
}

