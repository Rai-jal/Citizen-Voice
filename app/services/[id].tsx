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

export default function ServiceDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching service:", error);
        Alert.alert("Error", "Could not fetch service.");
      } else {
        setService(data);
      }
    };

    fetchService();
  }, [id]);

  if (!service) return <ActivityIndicator size="large" color="#3B82F6" />;

  return (
    <ScrollView className="p-6 bg-gray-50">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-600 font-medium">← Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-2">{service.name}</Text>
      <Text className="text-gray-800">{service.description}</Text>
    </ScrollView>
  );
}
