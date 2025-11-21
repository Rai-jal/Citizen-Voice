import FontAwesome from "@expo/vector-icons/FontAwesome";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/components/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { validateEnvironment } from "../lib/config";
import { supabase } from "../lib/supabase";

export { ErrorBoundary };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [configError, setConfigError] = useState<string | null>(null);

  // Validate environment variables at startup (production only)
  useEffect(() => {
    if (!__DEV__) {
      try {
        validateEnvironment();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown configuration error";
        setConfigError(errorMessage);
        Alert.alert(
          "Configuration Error",
          `${errorMessage}\n\nPlease contact support if this error persists.`,
          [{ text: "OK" }]
        );
      }
    }
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // -----------------------------
  // Check if user is logged in
  // -----------------------------
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user); // true if logged in, false if not
    };

    checkUser();

    // Optional: subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Show configuration error if production env vars are missing
  if (configError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Configuration Error
        </Text>
        <Text style={{ fontSize: 14, textAlign: "center", color: "#666" }}>
          {configError}
        </Text>
        <Text style={{ fontSize: 12, marginTop: 20, color: "#999" }}>
          Please contact support
        </Text>
      </View>
    );
  }

  if (!loaded || isLoggedIn === null) return null; // wait for fonts + auth

  return <RootLayoutNav isLoggedIn={isLoggedIn} />;
}

function RootLayoutNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Show login stack if not logged in */}
          {!isLoggedIn ? (
            <Stack.Screen name="(auth)" />
          ) : (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="admin" />
            </>
          )}
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="news" />
          <Stack.Screen name="services" />
          <Stack.Screen name="opportunities" />
          <Stack.Screen name="settings" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="privacy-policy"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="terms-of-service"
            options={{ presentation: "modal" }}
          />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
