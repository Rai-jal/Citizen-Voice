/**
 * Admin Users Management
 * View and manage users and roles
 */

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface UserWithRole extends SupabaseUser {
  role?: string;
  lastSignIn?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Note: This requires admin access to auth.users table
      // In production, you'd use a Supabase admin API or create a users view
      // For now, we'll fetch from a users table if it exists
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // If users table doesn't exist, show message
        if (error.code === "42P01") {
          Alert.alert(
            "Info",
            "Users table not found. User management requires a users table or admin API access."
          );
          setUsers([]);
        } else {
          Alert.alert("Error", `Failed to fetch users: ${error.message}`);
          setUsers([]);
        }
      } else {
        // Map to UserWithRole format
        setUsers(
          (data || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            user_metadata: user.user_metadata || {},
            role: user.role || user.user_metadata?.role,
            lastSignIn: user.last_sign_in_at,
          })) as UserWithRole[]
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to fetch users: ${errorMessage}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      // Update user metadata with role
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role },
      });

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert("Success", `User role updated to ${role}`);
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update user role: ${errorMessage}`);
    }
  };

  const renderUser = ({ item }: { item: UserWithRole }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-start mb-3">
        <View className="bg-blue-100 rounded-full p-3 mr-3">
          <User size={24} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.email}
          </Text>
          <Text className="text-gray-500 text-xs mb-1">
            Role: {item.role || item.user_metadata?.role || "user"}
          </Text>
          <Text className="text-gray-400 text-xs">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          {item.lastSignIn && (
            <Text className="text-gray-400 text-xs">
              Last sign in: {new Date(item.lastSignIn).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-blue-500 py-2 rounded-lg"
          onPress={() => updateUserRole(item.id, "user")}
        >
          <Text className="text-white font-semibold text-center">Set User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-purple-500 py-2 rounded-lg"
          onPress={() => updateUserRole(item.id, "moderator")}
        >
          <Text className="text-white font-semibold text-center">
            Set Moderator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-green-500 py-2 rounded-lg"
          onPress={() => updateUserRole(item.id, "admin")}
        >
          <Text className="text-white font-semibold text-center">
            Set Admin
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Users Management
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : users.length === 0 ? (
          <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <Text className="text-yellow-800 text-sm">
              User management requires admin API access or a users table in your
              database.
            </Text>
            <Text className="text-yellow-700 text-xs mt-2">
              To enable this feature, create a users table or use Supabase Admin
              API.
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}
