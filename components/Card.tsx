import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";

type CardProps = ViewProps & {
  children: ReactNode;
};

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View
      className="bg-white rounded-xl border border-gray-100 shadow-sm"
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
}


