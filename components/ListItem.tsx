import React from "react";
import { TouchableOpacity, View, Text, TouchableOpacityProps } from "react-native";

type ListItemProps = TouchableOpacityProps & {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function ListItem({ title, subtitle, right, style, ...rest }: ListItemProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
      style={style}
      {...rest}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View>{right}</View> : null}
      </View>
    </TouchableOpacity>
  );
}


