import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";

type CardVariant = "default" | "elevated" | "outlined";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = ViewProps & {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  style,
  className = "",
  ...rest
}: CardProps) {
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white shadow-md",
    outlined: "bg-white border-2 border-gray-300",
  };

  // Mobile-first padding scale
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <View
      className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
}


