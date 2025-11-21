/**
 * Admin Fact Checks Management
 * Verify and approve/reject fact checks
 */

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react-native";
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
import type { FactCheck, FactCheckVerdict } from "../../types";

export default function AdminFactChecksPage() {
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FactCheckVerdict | "all">("all");

  // Helper to get verdict label
  const getVerdictLabel = (verdict: FactCheckVerdict): string => {
    switch (verdict) {
      case "queued":
        return "Queued";
      case "in-progress":
        return "In Progress";
      case "verified":
        return "Verified";
      case "disputed":
        return "Disputed";
      case "needs-review":
        return "Needs Review";
      default:
        return verdict;
    }
  };

  useEffect(() => {
    fetchFactChecks();
  }, [filter]);

  const fetchFactChecks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("fact_checks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("verdict", filter);
      }

      const { data, error } = await query;

      if (error) {
        Alert.alert("Error", `Failed to fetch fact checks: ${error.message}`);
        setFactChecks([]);
      } else {
        setFactChecks(data || []);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to fetch fact checks: ${errorMessage}`);
      setFactChecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFactCheckVerdict = async (
    id: string,
    verdict: FactCheckVerdict
  ) => {
    try {
      const { error } = await supabase
        .from("fact_checks")
        .update({ verdict })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert("Success", `Fact check ${verdict} successfully`);
      fetchFactChecks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update fact check: ${errorMessage}`);
    }
  };

  const renderFactCheck = ({ item }: { item: FactCheck }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.title}
          </Text>
          {item.description && (
            <Text className="text-gray-600 text-sm mb-2">
              {item.description}
            </Text>
          )}
          <Text className="text-gray-400 text-xs">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.verdict === "verified"
              ? "bg-green-100"
              : item.verdict === "disputed"
              ? "bg-red-100"
              : item.verdict === "in-progress" ||
                item.verdict === "needs-review"
              ? "bg-yellow-100"
              : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold capitalize ${
              item.verdict === "verified"
                ? "text-green-700"
                : item.verdict === "disputed"
                ? "text-red-700"
                : item.verdict === "in-progress" ||
                  item.verdict === "needs-review"
                ? "text-yellow-700"
                : "text-gray-700"
            }`}
          >
            {getVerdictLabel(item.verdict)}
          </Text>
        </View>
      </View>

      {(item.verdict === "queued" || item.verdict === "needs-review") && (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 bg-blue-500 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => updateFactCheckVerdict(item.id, "in-progress")}
          >
            <Clock size={16} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Start Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.verdict === "in-progress" && (
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 bg-green-500 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => updateFactCheckVerdict(item.id, "verified")}
          >
            <CheckCircle size={16} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Verify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-500 py-2 rounded-lg flex-row items-center justify-center"
            onPress={() => updateFactCheckVerdict(item.id, "disputed")}
          >
            <XCircle size={16} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Dispute</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-yellow-500 px-4 py-2 rounded-lg"
            onPress={() => updateFactCheckVerdict(item.id, "needs-review")}
          >
            <AlertTriangle size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Fact Checks Management
        </Text>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-4 flex-wrap">
          {(
            [
              "all",
              "queued",
              "in-progress",
              "verified",
              "disputed",
              "needs-review",
            ] as const
          ).map((status) => (
            <TouchableOpacity
              key={status}
              className={`px-4 py-2 rounded-lg ${
                filter === status
                  ? "bg-blue-600"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() => {
                if (status === "all") {
                  setFilter("all");
                } else {
                  setFilter(status as FactCheckVerdict);
                }
              }}
            >
              <Text
                className={`font-medium capitalize ${
                  filter === status ? "text-white" : "text-gray-700"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status === "in-progress"
                  ? "In Progress"
                  : status === "needs-review"
                  ? "Needs Review"
                  : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fact Checks List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : factChecks.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">
            No fact checks found
          </Text>
        ) : (
          <FlatList
            data={factChecks}
            renderItem={renderFactCheck}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}
