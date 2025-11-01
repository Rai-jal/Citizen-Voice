import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Mic,
  Search,
  Upload,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase"; // <-- adjust if needed

export default function FactCheckScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [recentChecks, setRecentChecks] = useState([
    {
      id: "1",
      title: "New Education Policy Announced",
      status: "verified",
      source: "Ministry of Education",
    },
    {
      id: "2",
      title: "Healthcare Funding Increase",
      status: "in-progress",
      source: "Health Department",
    },
    {
      id: "3",
      title: "Public Transport Changes",
      status: "disputed",
      source: "City Council",
    },
  ]);

  // 🎙️ Voice Recording
  const handleVoiceRecord = async () => {
    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        if (uri) await uploadToSupabase(uri, "audio");
      } else {
        // Start recording
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission required", "Please allow microphone access.");
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  // 📁 File Upload
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled || !result.assets?.length) return;

      const fileUri = result.assets[0].uri;
      await uploadToSupabase(fileUri, "document");
    } catch (error) {
      console.error("File upload error:", error);
      Alert.alert("Error", "Failed to upload file.");
    }
  };

  // ☁️ Upload File/Audio to Supabase Storage
  const uploadToSupabase = async (fileUri: string, type: string) => {
    try {
      setIsUploading(true);
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileExt = fileUri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("fact-checks")
        .upload(fileName, blob, { upsert: true });

      if (error) throw error;

      const filePath = data.path;
      await supabase.from("fact_checks").insert({
        title: type === "audio" ? "Voice Submission" : "Document Submission",
        type,
        file_path: filePath,
        verdict: "queued",
      });

      setUploadedFiles((prev) => [...prev, filePath]);
      Alert.alert("Success", "File submitted for fact-checking.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Upload failed.");
    } finally {
      setIsUploading(false);
      setIsRecording(false);
    }
  };

  // 🔍 Search Handler
  const handleSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert("Search", `Searching for: ${searchQuery}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle color="#10B981" size={20} />;
      case "disputed":
        return <AlertTriangle color="#EF4444" size={20} />;
      case "in-progress":
        return <Clock color="#F59E0B" size={20} />;
      default:
        return <Info color="#6B7280" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Fact Checker
        </Text>
        <Text className="text-gray-600 mb-4">
          Verify news and government updates
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Search color="#94A3B8" size={20} />
          <TextInput
            className="flex-1 mx-2 text-gray-900"
            placeholder="Search for news or updates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Text className="text-blue-600 font-medium">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Note */}
        <TouchableOpacity
          className={`flex-row items-center justify-center rounded-full py-3 px-6 mb-4 ${
            isRecording ? "bg-red-100" : "bg-blue-100"
          }`}
          onPress={handleVoiceRecord}
        >
          <Mic color={isRecording ? "#EF4444" : "#2563EB"} size={20} />
          <Text
            className={`ml-2 font-medium ${
              isRecording ? "text-red-700" : "text-blue-700"
            }`}
          >
            {isRecording ? "Stop Recording" : "Record Voice Note"}
          </Text>
        </TouchableOpacity>

        {/* Document Upload */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-gray-200 rounded-full py-3 px-6"
          onPress={handleFileUpload}
        >
          <Upload color="#475569" size={20} />
          <Text className="ml-2 font-medium text-gray-700">
            Upload Document
          </Text>
        </TouchableOpacity>

        {isUploading && (
          <View className="flex-row items-center justify-center mt-3">
            <ActivityIndicator size="small" color="#2563EB" />
            <Text className="ml-2 text-gray-600">Uploading...</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Quick Actions + Recent Checks (Same UI as yours) */}
        {/* ... keep same content here */}
      </ScrollView>
    </View>
  );
}
