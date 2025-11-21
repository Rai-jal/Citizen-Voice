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
import { servicesService } from "../../services/supabaseService";
import type { Service } from "../../types";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      setIsLoading(true);
      const { data, error } = await servicesService.getById(id);

      if (error) {
        Alert.alert("Error", `Could not fetch service: ${error.message}`);
        setService(null);
      } else {
        setService(data);
      }
      setIsLoading(false);
    };

    fetchService();
  }, [id]);

  if (isLoading || !service) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading service...</Text>
      </View>
    );
  }

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
