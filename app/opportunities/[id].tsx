import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { opportunitiesService } from "../../services/supabaseService";
import type { Opportunity } from "../../types";

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOpportunity = async () => {
      setIsLoading(true);
      const { data, error } = await opportunitiesService.getById(id);

      if (error) {
        Alert.alert("Error", `Could not fetch opportunity: ${error.message}`);
        setOpportunity(null);
      } else {
        setOpportunity(data);
      }
      setIsLoading(false);
    };

    fetchOpportunity();
  }, [id]);

  if (isLoading || !opportunity) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading opportunity...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="p-6 bg-gray-50">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-600 font-medium">← Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-2">{opportunity.title}</Text>
      <Text className="text-gray-700 mb-2">{opportunity.organization}</Text>
      <Text className="text-gray-800">{opportunity.description}</Text>
      <Text className="text-gray-500 mt-2">
        Deadline: {opportunity.deadline}
      </Text>
    </ScrollView>
  );
}
