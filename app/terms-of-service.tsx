/**
 * Terms of Service Page
 */

import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">
          Terms of Service
        </Text>
      </View>
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-gray-800 text-base leading-7 mb-4">
          <Text className="font-bold text-lg mb-2">Agreement to Terms</Text>
          {"\n\n"}
          By accessing or using CitizenVoice ("the App"), you agree to be bound
          by these Terms of Service ("Terms"). If you disagree with any part of
          these terms, you may not access the App.{"\n\n"}
          <Text className="font-bold text-lg mb-2">Description of Service</Text>
          {"\n\n"}
          CitizenVoice is a mobile application that allows users to:{"\n"}-
          Submit reports and complaints{"\n"}- Verify information through
          fact-checking{"\n"}- Access government services and opportunities
          {"\n"}- View news and updates{"\n"}- Interact with an AI assistant
          {"\n\n"}
          <Text className="font-bold text-lg mb-2">User Accounts</Text>
          {"\n\n"}- You must provide accurate and complete information when
          creating an account{"\n"}- You are responsible for maintaining the
          security of your account{"\n"}- You are responsible for all activities
          that occur under your account{"\n"}- You must notify us immediately of
          any unauthorized use{"\n\n"}
          <Text className="font-bold text-lg mb-2">User Conduct</Text>
          {"\n\n"}
          You agree not to:{"\n"}- Submit false, misleading, or fraudulent
          information{"\n"}- Use the App for any illegal purpose{"\n"}- Harass,
          abuse, or harm other users{"\n"}- Upload malicious code or viruses
          {"\n"}- Impersonate any person or entity{"\n"}- Violate any applicable
          laws or regulations{"\n\n"}
          <Text className="font-bold text-lg mb-2">Report Submission</Text>
          {"\n\n"}- Reports are reviewed by administrators before publication
          {"\n"}- We reserve the right to reject or remove reports{"\n"}-
          Anonymous reports are subject to the same review process{"\n"}- False
          or misleading reports may result in account suspension{"\n\n"}
          <Text className="font-bold text-lg mb-2">
            Limitation of Liability
          </Text>
          {"\n\n"}- The App is provided "as is" without warranties{"\n"}- We are
          not liable for any damages arising from use of the App{"\n"}- We are
          not responsible for third-party content{"\n"}- We do not guarantee
          uninterrupted or error-free service{"\n\n"}
          <Text className="font-bold text-lg mb-2">Contact Us</Text>
          {"\n\n"}
          If you have any questions about these Terms, please contact us at
          support@citizenvoice.com
        </Text>
      </ScrollView>
    </View>
  );
}
