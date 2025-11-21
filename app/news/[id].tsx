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
import { newsService, storageService } from "../../services/supabaseService";
import type { News } from "../../types";

export default function NewsDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      setIsLoading(true);
      const { data, error } = await newsService.getById(id);

      if (error) {
        Alert.alert("Error", `Could not fetch news item: ${error.message}`);
        setNews(null);
      } else {
        setNews(data);

        // If imageUrl is a storage path, get public URL
        if (data?.imageUrl && data.imageUrl.startsWith("news/")) {
          const publicUrl = storageService.getPublicUrl(
            "news-images",
            data.imageUrl
          );
          setImageUrl(publicUrl);
        } else if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      }
      setIsLoading(false);
    };

    fetchNews();
  }, [id]);

  if (isLoading || !news) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading news article...</Text>
      </View>
    );
  }

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
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-60 rounded-2xl mb-6"
          resizeMode="cover"
          onError={() => setImageUrl(null)}
        />
      )}

      {/* Summary */}
      <Text className="text-gray-800 text-base leading-7 mb-4">
        {news.summary}
      </Text>

      {/* Full content */}
      {news.content && (
        <Text className="text-gray-800 text-base leading-7 mt-4">
          {news.content}
        </Text>
      )}
    </ScrollView>
  );
}
