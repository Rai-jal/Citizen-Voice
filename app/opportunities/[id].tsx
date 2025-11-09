import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOpportunity = async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching opportunity:", error);
        Alert.alert("Error", "Could not fetch opportunity.");
      } else {
        setOpportunity(data);
      }
    };

    fetchOpportunity();
  }, [id]);

  if (!opportunity) return <ActivityIndicator size="large" color="#3B82F6" />;

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
