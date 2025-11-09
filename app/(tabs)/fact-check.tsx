import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Mic,
  Search,
  Upload,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { supabase } from "../../lib/supabase";

export default function FactCheckScreen() {
  const [claimText, setClaimText] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Audio.requestPermissionsAsync();
    fetchFactChecks();
  }, []);

  // 📡 Fetch recent checks
  const fetchFactChecks = async () => {
    const { data, error } = await supabase
      .from("fact_checks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) setRecentChecks(data);
  };

  // 🎙️ Record audio
  const handleRecordAudio = async () => {
    try {
      if (isRecording) {
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        if (uri) {
          setAttachments((prev) => [
            ...prev,
            {
              id: uuid.v4().toString(),
              uri,
              type: "audio",
              name: "recording.m4a",
            },
          ]);
        }
        setRecording(null);
        setIsRecording(false);
      } else {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission denied", "Please allow microphone access.");
          return;
        }

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Recording Error:", error);
      Alert.alert("Error", "Recording failed.");
    }
  };

  // 📄 Upload document or media
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.type === "success") {
        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            uri: result.uri,
            name: result.name,
            type: "document",
          },
        ]);
      }

      const img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });

      if (!img.canceled && img.assets?.length) {
        const file = img.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            uri: file.uri,
            name: file.fileName || "media",
            type: file.type || "image",
          },
        ]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload file.");
    }
  };

  // 🗑 Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ☁️ Upload file to Supabase
  const uploadFile = async (file: any) => {
    const ext = file.name.split(".").pop();
    const fileName = `${uuid.v4()}.${ext}`;
    const filePath = `fact-checks/${fileName}`;

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("fact-checks")
      .upload(filePath, blob);
    if (error) throw error;
    return filePath;
  };

  // 🚀 Submit claim
  const handleSubmit = async () => {
    if (!claimText && attachments.length === 0) {
      Alert.alert("Error", "Please provide a claim or upload a file.");
      return;
    }

    try {
      setIsUploading(true);

      // Upload files
      const uploaded = [];
      for (const a of attachments) {
        const path = await uploadFile(a);
        uploaded.push({ name: a.name, path, type: a.type });
      }

      // Save fact-check record
      const { error } = await supabase.from("fact_checks").insert([
        {
          title: claimText || "Untitled Claim",
          attachments: uploaded,
          verdict: "pending",
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Claim submitted and pending verification!");
      setClaimText("");
      setAttachments([]);
      fetchFactChecks();
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Submission failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Fact Checker
        </Text>
        <Text className="text-gray-600 mb-4">
          Submit a claim or upload a file for verification.
        </Text>

        {/* Input */}
        <TextInput
          placeholder="Write your claim here..."
          value={claimText}
          onChangeText={setClaimText}
          className="bg-white p-3 rounded-xl text-gray-900 mb-3 border border-gray-200"
          multiline
        />

        {/* Attachments */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-2">
            <TouchableOpacity
              className="flex-1 mr-2 flex-row items-center justify-center bg-blue-100 p-3 rounded-xl"
              onPress={handleFileUpload}
            >
              <Upload color="#2563EB" size={20} />
              <Text className="ml-2 text-blue-700 font-medium">
                Upload File
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${
                isRecording ? "bg-red-100" : "bg-green-100"
              }`}
              onPress={handleRecordAudio}
            >
              <Mic color={isRecording ? "#EF4444" : "#10B981"} size={20} />
              <Text
                className={`ml-2 font-medium ${
                  isRecording ? "text-red-700" : "text-green-700"
                }`}
              >
                {isRecording ? "Stop" : "Record"}
              </Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View className="bg-gray-100 p-2 rounded-lg mb-3">
              {attachments.map((a) => (
                <View
                  key={a.id}
                  className="flex-row items-center justify-between bg-white p-2 mb-2 rounded-lg"
                >
                  <Text className="text-gray-800 flex-1">{a.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(a.id)}
                  >
                    <X color="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-green-500 py-3 rounded-xl items-center mb-4"
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Submit Claim</Text>
          )}
        </TouchableOpacity>

        {/* Search */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3">
          <Search color="#94A3B8" size={20} />
          <TextInput
            placeholder="Search your fact checks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-900"
          />
        </View>

        {/* Recent Checks */}
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Recent Fact Checks
        </Text>
        {recentChecks.length === 0 ? (
          <Text className="text-gray-500 text-center py-3">
            No submissions yet.
          </Text>
        ) : (
          recentChecks.map((item) => (
            <View
              key={item.id}
              className="bg-white p-4 mb-2 rounded-xl flex-row justify-between items-center shadow-sm"
            >
              <View>
                <Text className="font-semibold text-gray-900">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500">{item.verdict}</Text>
              </View>
              {item.verdict === "approved" ? (
                <CheckCircle color="#10B981" size={20} />
              ) : item.verdict === "rejected" ? (
                <AlertTriangle color="#EF4444" size={20} />
              ) : (
                <Clock color="#F59E0B" size={20} />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
