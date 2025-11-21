/**
 * Admin Content Management
 * CRUD operations for News, Services, and Opportunities
 */

import { useRouter } from "expo-router";
import {
  Briefcase,
  Edit,
  FileText,
  Newspaper,
  Plus,
  Trash2,
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
import {
  newsService,
  opportunitiesService,
  servicesService,
} from "../../services/supabaseService";
import type { News, Opportunity, Service } from "../../types";

type ContentType = "news" | "services" | "opportunities";

export default function AdminContentPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>("news");
  const [news, setNews] = useState<News[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [contentType]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      switch (contentType) {
        case "news":
          const { data: newsData, error: newsError } =
            await newsService.getAll();
          if (newsError) throw newsError;
          setNews(newsData || []);
          break;
        case "services":
          const { data: servicesData, error: servicesError } =
            await servicesService.getAll();
          if (servicesError) throw servicesError;
          setServices(servicesData || []);
          break;
        case "opportunities":
          const { data: opportunitiesData, error: opportunitiesError } =
            await opportunitiesService.getAll();
          if (opportunitiesError) throw opportunitiesError;
          setOpportunities(opportunitiesData || []);
          break;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to fetch ${contentType}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Note: This would need a delete method in the service
            Alert.alert(
              "Info",
              "Delete functionality needs to be implemented in the service layer"
            );
            fetchContent();
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            Alert.alert("Error", `Failed to delete item: ${errorMessage}`);
          }
        },
      },
    ]);
  };

  const renderNewsItem = ({ item }: { item: News }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-600 text-sm mb-2">{item.summary}</Text>
      <Text className="text-gray-400 text-xs mb-3">{item.date}</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.push(`/admin/content/news/${item.id}`)}
        >
          <Edit size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-4 py-2 rounded-lg"
          onPress={() => deleteItem(item.id)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
      <Text className="text-gray-600 text-sm mb-2">{item.description}</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.push(`/admin/content/services/${item.id}`)}
        >
          <Edit size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-4 py-2 rounded-lg"
          onPress={() => deleteItem(item.id)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOpportunityItem = ({ item }: { item: Opportunity }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-600 text-sm mb-1">{item.organization}</Text>
      <Text className="text-gray-500 text-xs mb-2">
        Deadline: {item.deadline}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.push(`/admin/content/opportunities/${item.id}`)}
        >
          <Edit size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-4 py-2 rounded-lg"
          onPress={() => deleteItem(item.id)}
        >
          <Trash2 size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Content Management
        </Text>

        {/* Content Type Tabs */}
        <View className="flex-row gap-2 mb-4">
          {[
            { type: "news" as ContentType, icon: Newspaper, label: "News" },
            {
              type: "services" as ContentType,
              icon: FileText,
              label: "Services",
            },
            {
              type: "opportunities" as ContentType,
              icon: Briefcase,
              label: "Opportunities",
            },
          ].map(({ type, icon: Icon, label }) => (
            <TouchableOpacity
              key={type}
              className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-lg ${
                contentType === type
                  ? "bg-blue-600"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() => setContentType(type)}
            >
              <Icon
                size={20}
                color={contentType === type ? "white" : "#6B7280"}
                className="mr-2"
              />
              <Text
                className={`font-medium ${
                  contentType === type ? "text-white" : "text-gray-700"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Button */}
        <TouchableOpacity
          className="bg-green-500 py-3 rounded-lg flex-row items-center justify-center mb-4"
          onPress={() => router.push(`/admin/content/${contentType}/new`)}
        >
          <Plus size={20} color="white" className="mr-2" />
          <Text className="text-white font-semibold">
            Add New {contentType}
          </Text>
        </TouchableOpacity>

        {/* Content List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : (
          <>
            {contentType === "news" && (
              <FlatList
                data={news}
                renderItem={renderNewsItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
            {contentType === "services" && (
              <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
            {contentType === "opportunities" && (
              <FlatList
                data={opportunities}
                renderItem={renderOpportunityItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
