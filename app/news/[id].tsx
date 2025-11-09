import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function NewsDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [news, setNews] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching news:", error);
        Alert.alert("Error", "Could not fetch news item.");
      } else setNews(data);
    };

    fetchNews();
  }, [id]);

  if (!news)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        {news.title}
      </Text>

      {/* Date */}
      <Text className="text-gray-500 mb-4">{news.date}</Text>

      {/* Image */}
      {news.imageUrl && (
        <Image
          source={{ uri: news.imageUrl }}
          className="w-full h-60 rounded-2xl mb-6"
          resizeMode="cover"
        />
      )}

      {/* Summary */}
      <Text className="text-gray-800 text-base leading-7">{news.summary}</Text>

      {/* Full content */}
      {news.content && (
        <Text className="text-gray-800 text-base leading-7 mt-4">
          {news.content}
        </Text>
      )}
    </ScrollView>
  );
}
