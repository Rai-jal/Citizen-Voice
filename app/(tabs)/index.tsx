import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import {
  FileText,
  LogOut,
  Mic,
  Search,
  Settings,
  Video as VideoIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { OfflineBanner } from "../../components/OfflineBanner";
import { useAuth } from "../../hooks/useAuth";
import { useNews } from "../../hooks/useNews";
import { useOpportunities } from "../../hooks/useOpportunities";
import { useReports } from "../../hooks/useReports";
import { useServices } from "../../hooks/useServices";
import { storageService } from "../../services/supabaseService";
import type {
  News,
  Opportunity,
  ReportWithAttachments,
  Service,
} from "../../types";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use hooks for data fetching
  const { user, signOut } = useAuth();
  const {
    news: allNews,
    isLoading: loadingNews,
    error: newsError,
    refetch: refetchNews,
  } = useNews();
  const {
    services: allServices,
    isLoading: loadingServices,
    error: servicesError,
    refetch: refetchServices,
  } = useServices();
  const {
    opportunities: allOpportunities,
    isLoading: loadingOpportunities,
    error: opportunitiesError,
    refetch: refetchOpportunities,
  } = useOpportunities();
  const {
    reports: allReports,
    isLoading: loadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useReports();

  // Filtered data based on search
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [reports, setReports] = useState<ReportWithAttachments[]>([]);

  const recordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".caf",
      audioQuality: 127,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
  };

  // -------------------------------
  // Helper
  // -------------------------------
  const getInitials = (email: string) => {
    const [first, last] = email.split("@")[0].split(".");
    return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
  };

  // -------------------------------
  // Update filtered data when search or data changes
  // -------------------------------
  useEffect(() => {
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      setNewsItems(
        allNews.filter(
          (item) =>
            item.title.toLowerCase().includes(lower) ||
            item.summary.toLowerCase().includes(lower)
        )
      );
      setServices(
        allServices.filter(
          (item) =>
            item.name.toLowerCase().includes(lower) ||
            item.description.toLowerCase().includes(lower)
        )
      );
      setOpportunities(
        allOpportunities.filter(
          (item) =>
            item.title.toLowerCase().includes(lower) ||
            item.description.toLowerCase().includes(lower)
        )
      );
      setReports(
        allReports.filter(
          (item) =>
            item.title.toLowerCase().includes(lower) ||
            item.description.toLowerCase().includes(lower)
        )
      );
    } else {
      setNewsItems(allNews);
      setServices(allServices);
      setOpportunities(allOpportunities);
      setReports(allReports);
    }
  }, [searchQuery, allNews, allServices, allOpportunities, allReports]);

  // -------------------------------
  // Handle errors
  // -------------------------------
  useEffect(() => {
    if (newsError) {
      Alert.alert("Error", `Failed to load news: ${newsError.message}`);
    }
    if (servicesError) {
      Alert.alert("Error", `Failed to load services: ${servicesError.message}`);
    }
    if (opportunitiesError) {
      Alert.alert(
        "Error",
        `Failed to load opportunities: ${opportunitiesError.message}`
      );
    }
    if (reportsError) {
      Alert.alert("Error", `Failed to load reports: ${reportsError.message}`);
    }
  }, [newsError, servicesError, opportunitiesError, reportsError]);

  // -------------------------------
  // Pull to refresh
  // -------------------------------
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchNews(),
        refetchServices(),
        refetchOpportunities(),
        refetchReports(),
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // -------------------------------
  // Search
  // -------------------------------
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filtering is handled in useEffect above
  };

  // -------------------------------
  // Voice Recording
  // -------------------------------
  const startRecording = async () => {
    try {
      setIsListening(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted")
        return Alert.alert(
          "Permission required",
          "Microphone permission is required"
        );

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(recordingOptions);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI()!;
      setRecording(null);

      // Use API service instead of direct OpenAI API call
      // The API key is now securely stored in Supabase Edge Functions
      const { transcribeAudio } = await import("../../lib/apiService");
      const result = await transcribeAudio(uri);

      if (result.success && result.data?.text) {
        handleSearch(result.data.text);
      } else {
        Alert.alert(
          "Transcription Error",
          result.error || "Failed to transcribe audio. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to transcribe audio: ${errorMessage}`);
    } finally {
      setIsListening(false);
    }
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const handleLogout = async () => {
    setShowProfileMenu(false);
    const success = await signOut();
    if (success) {
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  // -------------------------------
  // Render Functions
  // -------------------------------
  const renderReportItem = ({ item }: { item: ReportWithAttachments }) => {
    const getAttachmentUrl = (path: string) => {
      if (path.startsWith("http")) return path;
      return storageService.getPublicUrl("report-attachments", path);
    };

    return (
      <TouchableOpacity
        onPress={() => {
          // Report detail view - can be implemented later
          Alert.alert(
            "Report Details",
            `Title: ${item.title}\n\nDescription: ${item.description}`
          );
        }}
        className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      >
        <Text className="text-lg font-bold text-gray-900 mb-2">
          {item.title}
        </Text>
        <Text className="text-gray-700 mb-2">{item.description}</Text>
        {item.location && (
          <Text className="text-gray-500 text-sm">
            Location: {item.location}
          </Text>
        )}
        <Text className="text-gray-400 text-xs mb-2">
          {item.is_anonymous
            ? "Anonymous"
            : `Submitted by User ID: ${item.user_id}`}
        </Text>

        {/* Attachments if any */}
        {item.attachments && item.attachments.length > 0 && (
          <ScrollView horizontal className="mb-2">
            {item.attachments.map((att) => (
              <View key={att.id} className="mr-3">
                {att.type === "image" && (
                  <Image
                    source={{ uri: getAttachmentUrl(att.path) }}
                    className="w-24 h-24 rounded-lg"
                    onError={() => {}}
                  />
                )}
                {att.type === "video" && (
                  <View className="w-24 h-24 bg-black items-center justify-center rounded-lg">
                    <VideoIcon size={24} color="white" />
                  </View>
                )}
                {att.type === "audio" && (
                  <View className="w-24 h-24 bg-green-100 items-center justify-center rounded-lg">
                    <Mic size={24} color="green" />
                  </View>
                )}
                {att.type === "document" && (
                  <View className="w-24 h-24 bg-gray-100 items-center justify-center rounded-lg">
                    <FileText size={24} color="gray" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>
    );
  };

  const renderNewsItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      onPress={() => router.push(`/news/${item.id}`)}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
    >
      <Text className="text-lg font-bold text-gray-900 mb-2">{item.title}</Text>
      <Text className="text-gray-600 mb-3">{item.summary}</Text>
      <Text className="text-gray-400 text-sm">{item.date}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View
      className="bg-white rounded-2xl p-4 items-center justify-center mr-3 shadow-md border border-gray-200"
      style={{ width: 140, height: 140 }}
    >
      <View className="bg-blue-100 p-3 rounded-full mb-3">
        <Text className="text-2xl">{item.icon}</Text>
      </View>
      <Text className="text-gray-900 font-semibold text-center mb-2">
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => router.push(`/services/${item.id}`)}>
        <Text className="text-blue-600 text-sm font-medium">Learn More</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOpportunityItem = ({ item }: { item: Opportunity }) => (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-700 mb-2">{item.organization}</Text>
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => router.push(`/opportunities/${item.id}`)}
        >
          <Text className="text-blue-600 font-medium">Apply now</Text>
        </TouchableOpacity>
        <Text className="text-gray-500 text-sm">Deadline: {item.deadline}</Text>
      </View>
    </View>
  );

  // -------------------------------
  // Render Main
  // -------------------------------
  return (
    <View className="flex-1 bg-gray-50">
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-xl font-bold text-gray-900 flex-shrink"
            numberOfLines={1}
          >
            Hello {user?.email ? getInitials(user.email) : "User"}
          </Text>

          {/* Profile */}
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#3B82F6",
              }}
            >
              <Text className="text-white font-bold text-lg">
                {user ? getInitials(user.email) : "U"}
              </Text>
            </TouchableOpacity>

            {showProfileMenu && (
              <View
                style={{
                  position: "absolute",
                  top: 55,
                  right: 0,
                  width: 160,
                  backgroundColor: "white",
                  borderRadius: 12,
                  paddingVertical: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  elevation: 20,
                  zIndex: 999,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                  }}
                  onPress={() => router.push("/settings")}
                >
                  <Settings size={20} color="#4B5563" className="mr-2" />
                  <Text className="text-gray-700 font-medium">Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                  }}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color="#EF4444" className="mr-2" />
                  <Text className="text-red-600 font-semibold">Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Search size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-gray-800"
              placeholder="Search news, services, opportunities..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity
              onPress={isListening ? stopRecording : startRecording}
            >
              <Mic size={20} color={isListening ? "#3B82F6" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* News */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Latest News
          </Text>
          {loadingNews ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <FlatList
              data={newsItems}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Services */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Available Services
          </Text>
          {loadingServices ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <FlatList
              horizontal
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          )}
        </View>

        {/* Opportunities */}
        <View>
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Opportunities for Youth
          </Text>
          {loadingOpportunities ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <FlatList
              data={opportunities}
              renderItem={renderOpportunityItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
        {/* Reports Feed */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Community Reports
          </Text>
          {loadingReports ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : reports.length > 0 ? (
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-gray-500 text-center">
              No approved reports yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
