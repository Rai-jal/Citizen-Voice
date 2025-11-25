import { useRouter } from "expo-router";
import { Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Input } from "../../components/Input";
import { supabase } from "../../lib/supabase";
import { validateEmail } from "../../lib/validation";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Clear previous errors
    setError("");

    // Validate email
    if (!email || !email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password || password.length === 0) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (authError) {
        throw new Error(authError.message);
      }
      // Supabase will handle the redirect; no manual navigation needed here
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Google Sign-in failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <View className="mb-8 items-center">
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={{
                width: 100,
                height: 100,
                marginBottom: 16,
                resizeMode: "contain",
              }}
            />
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Sign in to access citizen services
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError("")}
            />
          )}

          {/* Login Form */}
          <View className="mb-6">
            {/* Email Input */}
            <Input
              label="Email"
              leftIcon={<Mail size={20} color="#6B7280" />}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Input */}
            <Input
              label="Password"
              leftIcon={<Lock size={20} color="#6B7280" />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  className="p-2"
                  accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                  accessibilityRole="button"
                >
                  {passwordVisible ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              }
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Forgot Password */}
            <View className="items-end mb-6">
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot_password")}
                className="py-2"
                accessibilityLabel="Forgot password"
                accessibilityRole="button"
              >
                <Text className="text-blue-600 font-semibold text-base">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleLogin}
              loading={loading}
            >
              Log In
            </Button>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-sm text-gray-500 mx-4">or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Login */}
          <View className="mb-8">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={handleGoogleLogin}
              icon={<Chrome size={20} color="#4285F4" />}
              disabled={loading}
            >
              Log in with Google
            </Button>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-base text-gray-600">Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              className="py-2 px-1"
              accessibilityLabel="Register for new account"
              accessibilityRole="button"
            >
              <Text className="text-blue-600 font-semibold text-base">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
