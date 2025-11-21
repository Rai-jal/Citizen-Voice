/**
 * Admin Reports Management
 * View, approve, and reject reports
 */

import { useRouter } from "expo-router";
import { CheckCircle, Eye, XCircle } from "lucide-react-native";
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
import type { Report, ReportStatus } from "../../types";

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | "all">("all");

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        Alert.alert("Error", `Failed to fetch reports: ${error.message}`);
        setReports([]);
      } else {
        setReports(data || []);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to fetch reports: ${errorMessage}`);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert("Success", `Report ${status} successfully`);
      fetchReports();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update report: ${errorMessage}`);
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.title}
          </Text>
          <Text className="text-gray-600 text-sm mb-2">{item.description}</Text>
          {item.location && (
            <Text className="text-gray-500 text-xs mb-1">
              Location: {item.location}
            </Text>
          )}
          <Text className="text-gray-400 text-xs">
            {item.is_anonymous ? "Anonymous" : `User ID: ${item.user_id}`}
          </Text>
          <Text className="text-gray-400 text-xs">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === "approved"
              ? "bg-green-100"
              : item.status === "rejected"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold capitalize ${
              item.status === "approved"
                ? "text-green-700"
                : item.status === "rejected"
                ? "text-red-700"
                : "text-yellow-700"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {item.status === "pending" && (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 bg-green-500 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => updateReportStatus(item.id, "approved")}
          >
            <CheckCircle size={16} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-500 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => updateReportStatus(item.id, "rejected")}
          >
            <XCircle size={16} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => router.push(`/admin/reports/${item.id}`)}
          >
            <Eye size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Reports Management
        </Text>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-4">
          {(["all", "pending", "approved", "rejected"] as const).map(
            (status) => (
              <TouchableOpacity
                key={status}
                className={`px-4 py-2 rounded-lg ${
                  filter === status
                    ? "bg-blue-600"
                    : "bg-white border border-gray-200"
                }`}
                onPress={() => setFilter(status)}
              >
                <Text
                  className={`font-medium capitalize ${
                    filter === status ? "text-white" : "text-gray-700"
                  }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Reports List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : reports.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">
            No reports found
          </Text>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}
