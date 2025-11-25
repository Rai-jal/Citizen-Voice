import React from "react";
import { TouchableOpacity, View, Text, TouchableOpacityProps } from "react-native";

type ListItemProps = TouchableOpacityProps & {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function ListItem({
  title,
  subtitle,
  left,
  right,
  style,
  className = "",
  ...rest
}: ListItemProps) {
  return (
    <TouchableOpacity
      className={`
        bg-white rounded-xl p-4 mb-4 border border-gray-200
        active:bg-gray-50 min-h-[68px]
        shadow-sm
        ${className}
      `}
      style={style}
      accessibilityRole="button"
      {...rest}
    >
      <View className="flex-row items-center gap-3">
        {/* Left icon/avatar */}
        {left && <View className="flex-shrink-0">{left}</View>}

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900 leading-5"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-sm text-gray-600 mt-1.5 leading-5"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right action/indicator */}
        {right && <View className="flex-shrink-0 ml-2">{right}</View>}
      </View>
    </TouchableOpacity>
  );
}


