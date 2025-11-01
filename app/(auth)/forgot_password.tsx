import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "citizenvoice://login", // optional: deep link back to your app
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Password reset link sent! Check your email.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-12">
        {/* Header */}
        <View className="mb-12 items-center">
          <Text className="text-3xl font-bold text-gray-900 mb-4">
            Forgot Password?
          </Text>
          <Text className="text-gray-500 text-center px-4">
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

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

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-blue-600 rounded-xl py-4 items-center mt-4 ${
            isLoading ? "opacity-70" : ""
          }`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <View className="flex-row justify-center mt-8">
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-600 font-medium">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
