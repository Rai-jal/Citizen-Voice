import React from "react";
import { AlertTriangle, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "./Button";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorMessage({
  message,
  onDismiss,
  onRetry,
}: ErrorMessageProps) {
  return (
    <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 mx-4">
      <View className="flex-row items-start">
        <AlertTriangle color="#DC2626" size={20} className="mt-0.5 flex-shrink-0" />
        <Text className="flex-1 text-red-700 text-sm leading-5 mx-3">
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            className="p-1 -mr-1 -mt-1"
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <X color="#DC2626" size={20} />
          </TouchableOpacity>
        )}
      </View>
      {onRetry && (
        <View className="mt-3">
          <Button variant="danger" size="sm" onPress={onRetry}>
            Try Again
          </Button>
        </View>
      )}
    </View>
  );
}

