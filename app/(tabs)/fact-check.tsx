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
import {
  sanitizeUserInput,
  validateFactCheckClaim,
  validateFileSize,
  validateFileType,
} from "../../lib/validation";
import {
  factChecksService,
  storageService,
} from "../../services/supabaseService";
import type { FactCheck, FileUpload } from "../../types";

export default function FactCheckScreen() {
  const [claimText, setClaimText] = useState("");
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recentChecks, setRecentChecks] = useState<FactCheck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimError, setClaimError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Audio.requestPermissionsAsync();
    fetchFactChecks();
  }, []);

  // 📡 Fetch recent checks
  const fetchFactChecks = async () => {
    setIsLoading(true);
    const { data, error } = await factChecksService.getAll();

    if (error) {
      Alert.alert("Error", `Failed to fetch fact checks: ${error.message}`);
      setRecentChecks([]);
    } else {
      setRecentChecks(data);
    }
    setIsLoading(false);
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
        // Validate file type
        const typeValidation = validateFileType(result.name, [
          "document",
          "image",
          "video",
        ]);
        if (!typeValidation.isValid) {
          Alert.alert(
            "Invalid File",
            typeValidation.error || "File type not allowed"
          );
          return;
        }

        // Validate file size
        if (result.size) {
          const sizeValidation = validateFileSize(result.size, 10); // 10MB limit
          if (!sizeValidation.isValid) {
            Alert.alert(
              "File Too Large",
              sizeValidation.error || "File size exceeds limit"
            );
            return;
          }
        }

        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            uri: result.uri,
            name: result.name,
            type: "document",
            size: result.size,
          },
        ]);
      }

      const img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!img.canceled && img.assets?.length) {
        const file = img.assets[0];
        const fileName =
          file.fileName || `media_${Date.now()}.${file.type || "jpg"}`;
        const fileType = file.type === "video" ? "video" : "image";

        // Validate file size
        if (file.fileSize) {
          const maxSize = fileType === "video" ? 50 : 10; // 50MB for videos, 10MB for images
          const sizeValidation = validateFileSize(file.fileSize, maxSize);
          if (!sizeValidation.isValid) {
            Alert.alert(
              "File Too Large",
              sizeValidation.error || "File size exceeds limit"
            );
            return;
          }
        }

        setAttachments((prev) => [
          ...prev,
          {
            id: uuid.v4().toString(),
            uri: file.uri,
            name: fileName,
            type: fileType,
            size: file.fileSize,
          },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to upload file: ${errorMessage}`);
    }
  };

  // 🗑 Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ☁️ Upload file to Supabase
  const uploadFile = async (file: FileUpload): Promise<string> => {
    try {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${uuid.v4()}.${ext}`;
      const filePath = `fact-checks/${fileName}`;

      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      const blob = await response.blob();

      const { data, error } = await storageService.uploadFile(
        "fact-checks",
        filePath,
        blob,
        { contentType: blob.type || "application/octet-stream" }
      );

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      return data || filePath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`File upload failed: ${errorMessage}`);
    }
  };

  // 🚀 Submit claim
  const handleSubmit = async () => {
    // Clear previous errors
    setClaimError(undefined);

    // Validate claim text (if provided)
    if (claimText) {
      const validation = validateFactCheckClaim(claimText);
      if (!validation.isValid) {
        setClaimError(validation.error);
        Alert.alert(
          "Validation Error",
          validation.error || "Please check the claim field."
        );
        return;
      }
    }

    if (!claimText.trim() && attachments.length === 0) {
      Alert.alert("Error", "Please provide a claim or upload a file.");
      return;
    }

    try {
      setIsUploading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      // Sanitize claim text
      const sanitizedClaim = claimText
        ? sanitizeUserInput(claimText.trim())
        : "Untitled Claim";

      // Upload files
      const uploaded: Array<{ name: string; path: string; type: string }> = [];
      for (const attachment of attachments) {
        try {
          const path = await uploadFile(attachment);
          uploaded.push({ name: attachment.name, path, type: attachment.type });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          Alert.alert(
            "Upload Error",
            `Failed to upload ${attachment.name}: ${errorMessage}`
          );
          // Continue with other files
        }
      }

      // Save fact-check record
      const { data, error } = await factChecksService.create({
        title: sanitizedClaim,
        description: claimText || undefined,
        verdict: "queued", // New submissions start as "queued"
        user_id: user?.id,
        attachments: uploaded.length > 0 ? uploaded : undefined,
      });

      if (error) {
        throw new Error(`Failed to create fact check: ${error.message}`);
      }

      Alert.alert("Success", "Claim submitted and queued for verification!");
      setClaimText("");
      setAttachments([]);
      setClaimError(undefined);
      fetchFactChecks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Submission failed";
      Alert.alert("Error", errorMessage);
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
        <View className="mb-3">
          <TextInput
            placeholder="Write your claim here..."
            value={claimText}
            onChangeText={(text) => {
              setClaimText(text);
              setClaimError(undefined);
            }}
            className={`bg-white p-3 rounded-xl text-gray-900 border ${
              claimError ? "border-red-500" : "border-gray-200"
            }`}
            multiline
          />
          {claimError && (
            <Text className="text-red-500 text-sm mt-1 ml-1">{claimError}</Text>
          )}
        </View>

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
        {isLoading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : recentChecks.length === 0 ? (
          <Text className="text-gray-500 text-center py-3">
            No submissions yet.
          </Text>
        ) : (
          recentChecks
            .filter((item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <View
                key={item.id}
                className="bg-white p-4 mb-2 rounded-xl flex-row justify-between items-center shadow-sm"
              >
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.verdict === "queued"
                      ? "Queued"
                      : item.verdict === "in-progress"
                      ? "In Progress"
                      : item.verdict === "verified"
                      ? "Verified"
                      : item.verdict === "disputed"
                      ? "Disputed"
                      : item.verdict === "needs-review"
                      ? "Needs Review"
                      : item.verdict}
                  </Text>
                </View>
                {item.verdict === "verified" ? (
                  <CheckCircle color="#10B981" size={20} />
                ) : item.verdict === "disputed" ? (
                  <AlertTriangle color="#EF4444" size={20} />
                ) : item.verdict === "in-progress" ||
                  item.verdict === "needs-review" ? (
                  <Clock color="#F59E0B" size={20} />
                ) : (
                  <Clock color="#6B7280" size={20} />
                )}
              </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}
