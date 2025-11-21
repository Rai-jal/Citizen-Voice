import { useRouter } from "expo-router";
import { Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { validateEmail } from "../../lib/validation";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate email
    if (!email || !email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password || password.length === 0) {
      Alert.alert("Validation Error", "Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert("Login Error", error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        throw new Error(error.message);
      }
      // Supabase will handle the redirect; no manual navigation needed here
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("Google Sign-in Error", message);
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
          <View className="mb-12 items-center">
            <Image
              source={require("../../assets/images/splash-icon.png")} // 👈 ensure your logo is placed here
              style={{
                width: 120,
                height: 120,
                marginBottom: 5,
                resizeMode: "contain",
              }}
            />
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-center">
              Sign in to access citizen services
            </Text>
          </View>

          {/* Login Form */}
          <View className="mb-8">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 ml-1 font-medium">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Mail size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text className="text-gray-700 mb-2 ml-1 font-medium">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Lock size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View className="items-end my-4">
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot_password")}
              >
                <Text className="text-blue-600 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-4 items-center mt-4"
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Logging in..." : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500 mx-4">or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Login */}
          <View className="mb-8">
            <TouchableOpacity
              className="flex-row items-center justify-center border border-gray-300 rounded-xl py-4"
              onPress={handleGoogleLogin}
            >
              <Chrome size={24} color="#4285F4" className="mr-3" />
              <Text className="text-gray-700 font-medium">
                Log in with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-blue-600 font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
