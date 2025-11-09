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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [user, setUser] = useState<any>(null);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

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
  // Fetch User
  // -------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) router.replace("/(auth)/login");
      else setUser(data.user);
    };
    fetchUser();
  }, []);

  // -------------------------------
  // Fetch Data
  // -------------------------------
  useEffect(() => {
    fetchNews();
    fetchServices();
    fetchOpportunities();
    fetchReports();
  }, []);

  const fetchNews = async () => {
    setLoadingNews(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false });
    if (error) console.error(error);
    setNewsItems(data || []);
    setLoadingNews(false);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    const { data, error } = await supabase.from("services").select("*");
    if (error) console.error(error);
    setServices(data || []);
    setLoadingServices(false);
  };

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("deadline", { ascending: true });
    if (error) console.error(error);
    setOpportunities(data || []);
    setLoadingOpportunities(false);
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setReports(data || []);
    setLoadingReports(false);
  };

  // -------------------------------
  // Search
  // -------------------------------
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();

    const filterItems = (items: any[], keys: string[]) =>
      items.filter((item) =>
        keys.some((key) => (item[key] ?? "").toLowerCase().includes(lower))
      );

    setNewsItems((prev) => filterItems(prev, ["title", "summary"]));
    setServices((prev) => filterItems(prev, ["name", "description"]));
    setOpportunities((prev) => filterItems(prev, ["title", "description"]));
    setReports((prev) => filterItems(prev, ["title", "description"]));
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

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.wav",
        type: "audio/wav",
      } as any);
      formData.append("model", "whisper-1");

      const res = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.text) handleSearch(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsListening(false);
    }
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    setShowProfileMenu(false);
    if (!error) router.replace("/(auth)/login");
  };

  // -------------------------------
  // Render Functions
  // -------------------------------
  const renderReportItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`../report/${item.id}`)}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
    >
      <Text className="text-lg font-bold text-gray-900 mb-2">{item.title}</Text>
      <Text className="text-gray-700 mb-2">{item.description}</Text>
      {item.location && (
        <Text className="text-gray-500 text-sm">Location: {item.location}</Text>
      )}
      <Text className="text-gray-400 text-xs mb-2">
        {item.is_anonymous
          ? "Anonymous"
          : `Submitted by User ID: ${item.user_id}`}
      </Text>

      {/* Attachments if any */}
      {item.attachments && item.attachments.length > 0 && (
        <ScrollView horizontal className="mb-2">
          {item.attachments.map((att: any) => (
            <View key={att.id} className="mr-3">
              {att.type === "image" && (
                <Image
                  source={{ uri: att.path }}
                  className="w-24 h-24 rounded-lg"
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

  const renderNewsItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/news/${item.id}`)}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
    >
      <Text className="text-lg font-bold text-gray-900 mb-2">{item.title}</Text>
      <Text className="text-gray-600 mb-3">{item.summary}</Text>
      <Text className="text-gray-400 text-sm">{item.date}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: any }) => (
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

  const renderOpportunityItem = ({ item }: { item: any }) => (
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
      <ScrollView className="flex-1 px-6 py-4">
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
