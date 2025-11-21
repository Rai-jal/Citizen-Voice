/**
 * Privacy Policy Page
 */

import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Privacy Policy</Text>
      </View>
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-gray-800 text-base leading-7 mb-4">
          <Text className="font-bold text-lg mb-2">Introduction</Text>
          {"\n\n"}
          CitizenVoice ("we", "our", or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our mobile application.
          {"\n\n"}
          <Text className="font-bold text-lg mb-2">Information We Collect</Text>
          {"\n\n"}
          <Text className="font-semibold">Personal Information:</Text>
          {"\n"}- Email address{"\n"}- Name (optional){"\n"}- User-generated
          content (reports, fact checks, comments){"\n\n"}
          <Text className="font-semibold">Usage Information:</Text>
          {"\n"}- Device information{"\n"}- App usage statistics{"\n"}- Location
          data (when provided by you){"\n"}- Audio recordings (when you use
          voice features){"\n\n"}
          <Text className="font-bold text-lg mb-2">
            How We Use Your Information
          </Text>
          {"\n\n"}
          We use the information we collect to:{"\n"}- Provide and maintain our
          services{"\n"}- Process and manage reports and fact checks{"\n"}- Send
          you notifications and updates{"\n"}- Improve our app and services
          {"\n"}- Detect and prevent fraud or abuse{"\n"}- Comply with legal
          obligations{"\n\n"}
          <Text className="font-bold text-lg mb-2">
            Data Storage and Security
          </Text>
          {"\n\n"}- Your data is stored securely using Supabase{"\n"}- We use
          encryption to protect sensitive information{"\n"}- We implement
          appropriate security measures to protect your data{"\n"}- Anonymous
          reports do not include personal identifiers{"\n\n"}
          <Text className="font-bold text-lg mb-2">Third-Party Services</Text>
          {"\n\n"}
          We use the following third-party services:{"\n"}- Supabase: Database
          and authentication services{"\n"}- OpenAI: AI services for
          transcription and chatbot (via secure backend){"\n"}- Expo: App
          development and deployment platform{"\n\n"}
          <Text className="font-bold text-lg mb-2">Your Rights</Text>
          {"\n\n"}
          You have the right to:{"\n"}- Access your personal data{"\n"}- Correct
          inaccurate data{"\n"}- Delete your account and data{"\n"}- Opt-out of
          certain data collection{"\n"}- Export your data{"\n\n"}
          <Text className="font-bold text-lg mb-2">Contact Us</Text>
          {"\n\n"}
          If you have any questions about this Privacy Policy, please contact us
          at support@citizenvoice.com
        </Text>
      </ScrollView>
    </View>
  );
}
