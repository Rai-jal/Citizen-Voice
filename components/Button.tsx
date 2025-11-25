import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  // Base classes with minimum 44px touch target for mobile
  const baseClasses = "flex-row items-center justify-center rounded-xl active:opacity-80";

  const variantClasses = {
    primary: "bg-blue-600",
    secondary: "bg-gray-100",
    outline: "border-2 border-blue-600 bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-red-600",
  };

  // Ensuring minimum 44px height for touch targets
  const sizeClasses = {
    sm: "px-4 py-2.5 min-h-[44px]", // 44px minimum
    md: "px-6 py-3.5 min-h-[48px]", // 48px for comfort
    lg: "px-8 py-4 min-h-[52px]",   // 52px for primary actions
  };

  const textVariantClasses = {
    primary: "text-white font-semibold",
    secondary: "text-gray-900 font-semibold",
    outline: "text-blue-600 font-semibold",
    ghost: "text-gray-900 font-medium",
    danger: "text-white font-semibold",
  };

  // Mobile-first font sizes (14-16px base)
  const textSizeClasses = {
    sm: "text-sm",      // 14px
    md: "text-base",    // 16px
    lg: "text-lg",      // 18px
  };

  const disabledClasses = "opacity-40";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <TouchableOpacity
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabled || loading ? disabledClasses : ""}
        ${className}
      `}
      disabled={disabled || loading}
      style={style}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger" ? "white" : "#2563EB"
          }
          size="small"
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

