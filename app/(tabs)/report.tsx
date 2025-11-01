import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Mic,
  Send,
  Video,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { supabase } from "../../lib/supabase";

type Attachment = {
  id: string;
  name: string;
  uri: string;
  type: "document" | "image" | "video" | "audio";
};

export default function ReportScreen() {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  // -------------------------
  // File selection handler
  // -------------------------
  const handleUpload = async () => {
    try {
      // Document
      const doc = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (doc.type === "success") {
        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            name: doc.name,
            uri: doc.uri,
            type: "document",
          },
        ]);
      }

      // Image
      const img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!img.canceled && img.assets?.length) {
        const file = img.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            name: "photo.jpg",
            uri: file.uri,
            type: "image",
          },
        ]);
      }

      // Video
      const vid = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
      if (!vid.canceled && vid.assets?.length) {
        const file = vid.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            name: "video.mp4",
            uri: file.uri,
            type: "video",
          },
        ]);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Failed to pick file.");
    }
  };

  // -------------------------
  // Audio Recording
  // -------------------------
  const handleRecordAudio = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        if (uri) {
          setAttachments((prev) => [
            ...prev,
            {
              id: uuid.v4().toString(),
              name: "recording.m4a",
              uri,
              type: "audio",
            },
          ]);
        }
        setRecording(null);
      } else {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission denied", "Microphone access required.");
          return;
        }
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Recording Error:", error);
    }
  };

  const handlePlayAudio = async (uri: string) => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    await newSound.playAsync();
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // -------------------------
  // Upload file to Supabase
  // -------------------------
  const uploadFile = async (file: Attachment) => {
    const ext = file.name.split(".").pop();
    const fileName = `${uuid.v4()}.${ext}`;
    const filePath = `reports/${fileName}`;

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("report-attachments")
      .upload(filePath, blob);

    if (error) throw error;
    return filePath;
  };

  // -------------------------
  // Submit Report
  // -------------------------
  const handleSubmit = async () => {
    if (!complaintTitle || !complaintDescription) {
      Alert.alert("Missing fields", "Please fill title and description.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user && !isAnonymous)
        throw new Error("User not authenticated. Enable anonymous mode.");

      // 1️⃣ Insert report
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert([
          {
            title: complaintTitle,
            description: complaintDescription,
            location: location || null,
            user_id: isAnonymous ? null : user?.id,
            is_anonymous: isAnonymous,
          },
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // 2️⃣ Upload each attachment
      for (const a of attachments) {
        const filePath = await uploadFile(a);
        const { error: attachError } = await supabase
          .from("report_attachments")
          .insert([
            {
              report_id: reportData.id,
              name: a.name,
              path: filePath,
              type: a.type,
            },
          ]);
        if (attachError) throw attachError;
      }

      // 3️⃣ Reset
      setComplaintTitle("");
      setComplaintDescription("");
      setLocation("");
      setAttachments([]);
      setIsAnonymous(false);

      Alert.alert("Success", "Report submitted successfully!");
    } catch (error: any) {
      console.error("Submit Error:", error.message || error);
      Alert.alert("Error", error.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white p-5 rounded-2xl shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Submit a Report
          </Text>

          {/* Anonymous */}
          <View className="flex-row items-center justify-between mb-4 bg-blue-50 p-3 rounded-xl">
            <View className="flex-row items-center">
              {isAnonymous ? (
                <EyeOff size={18} color="#1D4ED8" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
              <Text className="ml-2 text-gray-700 font-medium">
                Submit Anonymously
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              thumbColor={isAnonymous ? "#2563EB" : "#E5E7EB"}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            />
          </View>

          {/* Title */}
          <TextInput
            placeholder="Report Title"
            placeholderTextColor="#6B7280"
            value={complaintTitle}
            onChangeText={setComplaintTitle}
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 mb-4 text-gray-900"
          />

          {/* Description */}
          <TextInput
            placeholder="Describe your issue"
            placeholderTextColor="#6B7280"
            value={complaintDescription}
            onChangeText={setComplaintDescription}
            multiline
            className="border border-gray-300 rounded-xl p-3 bg-gray-50 mb-4 h-32 text-gray-900"
            textAlignVertical="top"
          />

          {/* Location */}
          {!isAnonymous && (
            <View className="flex-row items-center border border-gray-300 rounded-xl p-3 bg-gray-50 mb-4">
              <MapPin size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="Enter location"
                placeholderTextColor="#6B7280"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          )}

          {/* Attachments */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Attachments</Text>
            {attachments.length > 0 ? (
              <View className="flex-row flex-wrap gap-2 mb-2">
                {attachments.map((a) => (
                  <View
                    key={a.id}
                    className="flex-row items-center bg-blue-100 p-2 rounded-lg"
                  >
                    {a.type === "image" ? (
                      <Camera size={16} color="#4F86F7" />
                    ) : a.type === "video" ? (
                      <Video size={16} color="#4F86F7" />
                    ) : a.type === "audio" ? (
                      <Mic size={16} color="#4F86F7" />
                    ) : (
                      <FileText size={16} color="#4F86F7" />
                    )}
                    <Text className="ml-2 text-blue-700 text-sm">{a.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveAttachment(a.id)}
                    >
                      <Text className="ml-2 text-red-500 font-bold">X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No files attached
              </Text>
            )}

            {/* Upload Buttons */}
            <View className="flex-row justify-center gap-3">
              <TouchableOpacity
                className="flex-row items-center bg-blue-500 px-4 py-2 rounded-xl"
                onPress={handleUpload}
              >
                <FileText size={16} color="white" />
                <Text className="text-white ml-2 font-medium">Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center px-4 py-2 rounded-xl ${
                  isRecording ? "bg-red-500" : "bg-green-500"
                }`}
                onPress={handleRecordAudio}
              >
                <Mic size={16} color="white" />
                <Text className="text-white ml-2 font-medium">
                  {isRecording ? "Stop" : "Record Audio"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            className={`flex-row items-center justify-center p-4 rounded-xl ${
              complaintTitle && complaintDescription
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
            disabled={!complaintTitle || !complaintDescription || isSubmitting}
            onPress={handleSubmit}
          >
            <Send size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
