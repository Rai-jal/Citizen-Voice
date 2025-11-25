import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center bg-white border rounded-xl px-4
          min-h-[52px]
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}
        `}
      >
        {leftIcon && (
          <View className="mr-3" accessibilityLabel="Input icon">
            {leftIcon}
          </View>
        )}
        <TextInput
          className="flex-1 text-base text-gray-900 py-3"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={label}
          {...props}
        />
        {rightIcon && (
          <View className="ml-3" accessibilityLabel="Input action">
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-sm text-red-600 mt-1.5" accessibilityRole="alert">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="text-sm text-gray-500 mt-1.5">{helperText}</Text>
      )}
    </View>
  );
}

