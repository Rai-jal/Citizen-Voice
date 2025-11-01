import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { Mic, Search, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
  const [language, setLanguage] = useState("Krio");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [user, setUser] = useState<any>(null);

  const languages = ["Krio", "Mende", "Temne", "Limba", "Fullah", "English"];

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
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchNews();
    fetchServices();
    fetchOpportunities();
  }, []);

  const fetchNews = async () => {
    setLoadingNews(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setNewsItems(data || []);
    setLoadingNews(false);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    const { data, error } = await supabase.from("services").select("*");
    if (!error) setServices(data || []);
    setLoadingServices(false);
  };

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("deadline", { ascending: true });
    if (!error) setOpportunities(data || []);
    setLoadingOpportunities(false);
  };

  const handleSearch = (query: string) => {
    const lower = query.toLowerCase();
    setSearchQuery(query);
    setNewsItems((prev) =>
      prev.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.summary.toLowerCase().includes(lower)
      )
    );
  };

  const startRecording = async () => {
    try {
      setIsListening(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted")
        return alert("Microphone permission is required");

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
      if (data.text) {
        setSearchQuery(data.text);
        handleSearch(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsListening(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    setShowProfileMenu(false);
    if (!error) router.replace("/(auth)/login");
  };

  const renderNewsItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-2">{item.title}</Text>
      <Text className="text-gray-600 mb-3">{item.summary}</Text>
      <Text className="text-gray-400 text-sm">{item.date}</Text>
    </View>
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

      {/* Learn More as blue text */}
      <TouchableOpacity
        onPress={() => {
          if (item.documentUrl) {
            Linking.openURL(item.documentUrl);
          } else {
            alert("Document not available");
          }
        }}
      >
        <Text className="text-blue-600 text-sm font-medium">Learn More</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOpportunityItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-700 mb-2">{item.organization}</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-blue-600 font-medium">Apply now</Text>
        <Text className="text-gray-500 text-sm">Deadline: {item.deadline}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-xl font-bold text-gray-900 flex-shrink"
            numberOfLines={1}
          >
            Hello{" "}
            {user?.user_metadata?.name
              ? user.user_metadata.name
              : user?.email
              ? user.email.split("@")[0]
              : "Guest"}
          </Text>

          {/* Profile */}
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              className="bg-blue-100 p-2 rounded-full"
              onPress={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User size={24} color="#3B82F6" />
            </TouchableOpacity>

            {showProfileMenu && (
              <View
                style={{
                  position: "absolute",
                  top: 45,
                  right: 0,
                  width: 180,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  elevation: 20,
                  zIndex: 999,
                }}
              >
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <Text className="text-gray-700 font-medium">
                    🌐 Change Language
                  </Text>
                </TouchableOpacity>

                {showLangDropdown && (
                  <View className="bg-gray-50 rounded-md p-2 mt-1">
                    {languages.map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => {
                          setLanguage(lang);
                          setShowLangDropdown(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                        }}
                      >
                        <Text className="text-gray-800">{lang}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => {
                    setShowProfileMenu(false);
                    router.push("/settings");
                  }}
                >
                  <Text className="text-gray-700 font-medium">⚙️ Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={handleLogout}
                >
                  <Text className="text-red-600 font-semibold">🚪 Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Search size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-gray-800"
              placeholder="Search services, news, opportunities..."
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

      {/* Main Content */}
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
      </ScrollView>
    </View>
  );
}
