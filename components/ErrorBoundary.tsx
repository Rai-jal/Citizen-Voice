/**
 * Global Error Boundary Component
 * Catches and displays errors in the React component tree
 */

import { AlertTriangle, RotateCcw } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return (
          <Fallback error={this.state.error!} resetError={this.resetError} />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="bg-red-100 rounded-full p-4 mb-4">
          <AlertTriangle size={48} color="#EF4444" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Something went wrong
        </Text>

        <Text className="text-gray-600 mb-4 text-center">
          We're sorry for the inconvenience. An error occurred while using the
          app.
        </Text>

        {__DEV__ && (
          <View className="bg-white rounded-xl p-4 mb-4 w-full">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Error Details:
            </Text>
            <Text className="text-xs text-gray-700 font-mono">
              {error.message}
            </Text>
            {error.stack && (
              <Text className="text-xs text-gray-500 font-mono mt-2">
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={resetError}
          className="bg-blue-600 rounded-xl px-6 py-3 flex-row items-center"
        >
          <RotateCcw size={20} color="white" className="mr-2" />
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
