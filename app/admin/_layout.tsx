/**
 * Admin Layout
 * Protects admin routes with authentication and authorization
 */

import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { isAdmin } from "../../lib/adminAuth";

export default function AdminLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAdminAccess() {
      if (authLoading) return;

      if (!user) {
        router.replace("/(auth)/login");
        return;
      }

      setIsChecking(true);
      const admin = await isAdmin();
      setIsAdminUser(admin);
      setIsChecking(false);

      if (!admin) {
        // Redirect to home if not admin
        router.replace("/(tabs)");
      }
    }

    checkAdminAccess();
  }, [user, authLoading, router]);

  // Show loading while checking admin status
  if (authLoading || isChecking || isAdminUser === null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Checking admin access...</Text>
      </View>
    );
  }

  // If not admin, redirect (handled in useEffect)
  if (!isAdminUser) {
    return null;
  }

  // Admin access granted - render admin routes
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="fact-checks" />
      <Stack.Screen name="content" />
      <Stack.Screen name="users" />
    </Stack>
  );
}
