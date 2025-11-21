/**
 * Admin Dashboard Home
 * Overview and quick access to admin functions
 */

import { useRouter } from "expo-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  FileText,
  Shield,
  Users,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const adminSections = [
    {
      title: "Reports",
      description: "Manage and approve reports",
      icon: BarChart3,
      route: "/admin/reports",
      color: "bg-blue-500",
    },
    {
      title: "Fact Checks",
      description: "Verify and approve fact checks",
      icon: Bot,
      route: "/admin/fact-checks",
      color: "bg-green-500",
    },
    {
      title: "Content",
      description: "Manage news, services, and opportunities",
      icon: FileText,
      route: "/admin/content",
      color: "bg-purple-500",
    },
    {
      title: "Users",
      description: "View and manage users",
      icon: Users,
      route: "/admin/users",
      color: "bg-orange-500",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <Shield size={32} color="#3B82F6" className="mr-3" />
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </Text>
              <Text className="text-gray-600">Welcome, {user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Admin Sections */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Management Tools
          </Text>
          {adminSections.map((section) => (
            <TouchableOpacity
              key={section.title}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              onPress={() => router.push(section.route as any)}
            >
              <View className="flex-row items-center">
                <View className={`${section.color} rounded-lg p-3 mr-4`}>
                  <section.icon size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {section.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {section.description}
                  </Text>
                </View>
                <ArrowRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900 mb-1">-</Text>
              <Text className="text-gray-600 text-sm">Pending Reports</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-2xl font-bold text-gray-900 mb-1">-</Text>
              <Text className="text-gray-600 text-sm">Pending Fact Checks</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Text className="text-blue-900 font-semibold mb-2">Admin Access</Text>
          <Text className="text-blue-800 text-sm">
            You have full administrative access to manage reports, fact checks,
            content, and users.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
