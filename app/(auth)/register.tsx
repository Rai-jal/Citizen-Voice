import { useRouter } from "expo-router";
import { Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
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

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    if (!termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the Terms of Service and Privacy Policy.",
      );
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Registration Error", error.message);
      } else {
        Alert.alert(
          "Success",
          "Account created successfully! Please verify your email.",
        );
        router.replace("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-12">
        {/* Header */}
        <View className="mb-12 items-center">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </Text>
          <Text className="text-gray-500 text-center">
            Join us today and start your journey
          </Text>
        </View>

        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 ml-1 font-medium">Full Name</Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
            <User size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-gray-800"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>
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
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-2">
          <Text className="text-gray-700 mb-2 ml-1 font-medium">Password</Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
            <Lock size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-gray-800"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
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

        {/* Terms Checkbox */}
        <View className="mt-6 mb-6">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              className={`w-6 h-6 rounded-md border-2 ${termsAccepted ? "bg-blue-600 border-blue-600" : "border-gray-300"} items-center justify-center`}
            >
              {termsAccepted && <Check size={16} color="white" />}
            </View>
            <Text className="text-gray-700 ml-3">
              I agree to the{" "}
              <Text className="text-blue-600">Terms of Service</Text> and{" "}
              <Text className="text-blue-600">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-4 ${termsAccepted ? "bg-blue-600" : "bg-gray-300"}`}
          onPress={handleRegister}
          disabled={!termsAccepted}
        >
          <Text className="text-white font-bold text-lg">Create Account</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-600 font-medium">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
