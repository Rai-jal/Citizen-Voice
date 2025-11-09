import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Globe,
  Key,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState("Krio");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.replace("/(auth)/login");
      else {
        setUser(data.user);
        setLanguage(data.user.user_metadata?.language || "Krio");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("/(auth)/login");
  };

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">{title}</Text>
      <View className="bg-white rounded-xl overflow-hidden shadow-sm">
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({
    icon,
    title,
    value,
    onPress,
    hasSwitch = false,
    switchValue,
    onSwitchChange,
    showChevron = false,
  }: {
    icon: React.ReactNode;
    title: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between py-4 px-4 ${
        hasSwitch ? "" : "active:bg-gray-50"
      }`}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View className="flex-row items-center flex-1">
        {icon}
        <Text className="text-gray-800 font-medium ml-3 flex-1">{title}</Text>
        {value && <Text className="text-gray-500 mr-2">{value}</Text>}
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#d1d5db", true: "#3B82F6" }}
            thumbColor={switchValue ? "#ffffff" : "#f4f4f5"}
          />
        )}
        {showChevron && <ChevronRight size={20} color="#9ca3af" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View className="mb-8 flex-row items-center">
          <TouchableOpacity
            className="p-2 mr-3"
            onPress={() => router.push("/")}
          >
            <ArrowLeft size={24} color="#3B82F6" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Settings</Text>
            <Text className="text-gray-600 mt-1">Manage your preferences</Text>
          </View>
        </View>

        {/* Profile Section */}
        <SettingsSection title="Profile">
          <SettingsItem
            icon={<User size={20} color="#3B82F6" />}
            title="Edit Profile"
            showChevron
            onPress={() => router.push("/")}
          />
          <View className="h-px bg-gray-100 mx-4" />
          <View className="py-4 px-4">
            <Text className="text-gray-500 text-sm mb-1">Email</Text>
            <Text className="text-gray-900">
              {user?.email || "user@example.com"}
            </Text>
          </View>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon={<Globe size={20} color="#3B82F6" />}
            title="Language"
            value={language}
            showChevron
            onPress={() => router.push("/")}
          />
          <View className="h-px bg-gray-100 mx-4" />
          <SettingsItem
            icon={<Bell size={20} color="#3B82F6" />}
            title="Notifications"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <View className="h-px bg-gray-100 mx-4" />
          <SettingsItem
            icon={<Moon size={20} color="#3B82F6" />}
            title="Dark Mode"
            hasSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<Key size={20} color="#3B82F6" />}
            title="Change Password"
            showChevron
            onPress={() => router.push("/")}
          />
          <View className="h-px bg-gray-100 mx-4" />
          <SettingsItem
            icon={<Shield size={20} color="#3B82F6" />}
            title="Privacy Policy"
            showChevron
            onPress={() => router.push("/")}
          />
          <View className="h-px bg-gray-100 mx-4" />
          <TouchableOpacity
            className="flex-row items-center py-4 px-4 active:bg-gray-50"
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="text-red-600 font-semibold ml-3">Logout</Text>
          </TouchableOpacity>
        </SettingsSection>

        {/* App Info */}
        <View className="mt-8 mb-4">
          <Text className="text-center text-gray-500 text-sm">
            App Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
