/**
 * Offline Banner Component
 * Displays when the device is offline
 */

import { WifiOff } from "lucide-react-native";
import { Text, View } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View className="bg-yellow-500 px-4 py-2 flex-row items-center justify-center">
      <WifiOff size={16} color="white" className="mr-2" />
      <Text className="text-white text-sm font-medium">
        No internet connection. Some features may be unavailable.
      </Text>
    </View>
  );
}
