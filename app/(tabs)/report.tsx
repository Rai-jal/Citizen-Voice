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
import {
  sanitizeUserInput,
  validateFileSize,
  validateFileType,
  validateLocation,
  validateReportDescription,
  validateReportTitle,
} from "../../lib/validation";
import type { FileUpload } from "../../types";

// Using FileUpload type from types/index.ts

export default function ReportScreen() {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Validation errors
  const [titleError, setTitleError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [locationError, setLocationError] = useState<string | undefined>();

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
        // Validate file type
        const typeValidation = validateFileType(doc.name, ["document"]);
        if (!typeValidation.isValid) {
          Alert.alert(
            "Invalid File",
            typeValidation.error || "File type not allowed"
          );
          return;
        }

        // Validate file size (if available)
        if (doc.size) {
          const sizeValidation = validateFileSize(doc.size, 10); // 10MB limit
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
            name: doc.name,
            uri: doc.uri,
            type: "document",
            size: doc.size,
          },
        ]);
      }

      // Image
      const img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!img.canceled && img.assets?.length) {
        const file = img.assets[0];
        const fileName = file.fileName || `photo_${Date.now()}.jpg`;

        // Validate file size
        if (file.fileSize) {
          const sizeValidation = validateFileSize(file.fileSize, 10); // 10MB limit
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
            name: fileName,
            uri: file.uri,
            type: "image",
            size: file.fileSize,
          },
        ]);
      }

      // Video
      const vid = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
      if (!vid.canceled && vid.assets?.length) {
        const file = vid.assets[0];
        const fileName = file.fileName || `video_${Date.now()}.mp4`;

        // Validate file size (videos can be larger)
        if (file.fileSize) {
          const sizeValidation = validateFileSize(file.fileSize, 50); // 50MB limit for videos
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
            name: fileName,
            uri: file.uri,
            type: "video",
            size: file.fileSize,
          },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to pick file: ${errorMessage}`);
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
  const uploadFile = async (file: FileUpload): Promise<string> => {
    try {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${uuid.v4()}.${ext}`;
      const filePath = `reports/${fileName}`;

      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("report-attachments")
        .upload(filePath, blob, {
          contentType: blob.type || "application/octet-stream",
        });

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      return filePath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`File upload failed: ${errorMessage}`);
    }
  };

  // -------------------------
  // Submit Report
  // -------------------------
  const handleSubmit = async () => {
    // Clear previous errors
    setTitleError(undefined);
    setDescriptionError(undefined);
    setLocationError(undefined);

    // Validate title
    const titleValidation = validateReportTitle(complaintTitle);
    if (!titleValidation.isValid) {
      setTitleError(titleValidation.error);
      Alert.alert(
        "Validation Error",
        titleValidation.error || "Please check the title field."
      );
      return;
    }

    // Validate description
    const descriptionValidation =
      validateReportDescription(complaintDescription);
    if (!descriptionValidation.isValid) {
      setDescriptionError(descriptionValidation.error);
      Alert.alert(
        "Validation Error",
        descriptionValidation.error || "Please check the description field."
      );
      return;
    }

    // Validate location (if provided)
    if (location) {
      const locationValidation = validateLocation(location);
      if (!locationValidation.isValid) {
        setLocationError(locationValidation.error);
        Alert.alert(
          "Validation Error",
          locationValidation.error || "Please check the location field."
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user && !isAnonymous) {
        throw new Error(
          "User not authenticated. Please enable anonymous mode or log in."
        );
      }

      // Sanitize inputs
      const sanitizedTitle = sanitizeUserInput(complaintTitle.trim());
      const sanitizedDescription = sanitizeUserInput(
        complaintDescription.trim()
      );
      const sanitizedLocation = location
        ? sanitizeUserInput(location.trim())
        : null;

      // 1️⃣ Upload attachments first
      const uploadedFiles: Array<{ name: string; path: string; type: string }> =
        [];
      for (const attachment of attachments) {
        try {
          const filePath = await uploadFile(attachment);
          uploadedFiles.push({
            name: attachment.name,
            path: filePath,
            type: attachment.type,
          });
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

      // 2️⃣ Insert report with status = "pending"
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert([
          {
            title: sanitizedTitle,
            description: sanitizedDescription,
            location: sanitizedLocation,
            user_id: isAnonymous ? null : user?.id,
            is_anonymous: isAnonymous,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (reportError) {
        throw new Error(`Failed to create report: ${reportError.message}`);
      }

      // 3️⃣ Link attachments
      if (uploadedFiles.length > 0 && reportData) {
        const { error: attachError } = await supabase
          .from("report_attachments")
          .insert(
            uploadedFiles.map((f) => ({
              report_id: reportData.id,
              name: f.name,
              path: f.path,
              type: f.type,
            }))
          );

        if (attachError) {
          // Report was created but attachments failed - still show success
          console.error("Failed to link attachments:", attachError);
          Alert.alert(
            "Report Submitted",
            "Your report has been submitted, but some attachments failed to upload. Please contact support if needed."
          );
          return;
        }
      }

      // 4️⃣ Reset form
      setComplaintTitle("");
      setComplaintDescription("");
      setLocation("");
      setAttachments([]);
      setIsAnonymous(false);
      setTitleError(undefined);
      setDescriptionError(undefined);
      setLocationError(undefined);

      Alert.alert(
        "Report Submitted",
        "Your report has been submitted and is pending admin approval."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Submission failed";
      Alert.alert("Error", errorMessage);
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
          <View className="mb-4">
            <TextInput
              placeholder="Report Title"
              placeholderTextColor="#6B7280"
              value={complaintTitle}
              onChangeText={(text) => {
                setComplaintTitle(text);
                setTitleError(undefined);
              }}
              className={`border rounded-xl p-3 bg-gray-50 text-gray-900 ${
                titleError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {titleError && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                {titleError}
              </Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-4">
            <TextInput
              placeholder="Describe your issue"
              placeholderTextColor="#6B7280"
              value={complaintDescription}
              onChangeText={(text) => {
                setComplaintDescription(text);
                setDescriptionError(undefined);
              }}
              multiline
              className={`border rounded-xl p-3 bg-gray-50 h-32 text-gray-900 ${
                descriptionError ? "border-red-500" : "border-gray-300"
              }`}
              textAlignVertical="top"
            />
            {descriptionError && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                {descriptionError}
              </Text>
            )}
          </View>

          {/* Location */}
          {!isAnonymous && (
            <View className="mb-4">
              <View
                className={`flex-row items-center border rounded-xl p-3 bg-gray-50 ${
                  locationError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-900"
                  placeholder="Enter location (optional)"
                  placeholderTextColor="#6B7280"
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    setLocationError(undefined);
                  }}
                />
              </View>
              {locationError && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {locationError}
                </Text>
              )}
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

          {/* Optional: Status note */}
          {isSubmitting && (
            <Text className="text-center text-sm text-gray-500 mt-3">
              Uploading your report and attachments...
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
