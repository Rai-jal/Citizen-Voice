import { Audio } from "expo-av";
import { Bot, Mic, Send, User } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ChatMessage } from "../../lib/apiService";
import { sendChatMessage, transcribeAudio } from "../../lib/apiService";

interface ChatMessageItem {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function MafaxsonChatbot() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "1",
      text: "Hello! I'm Mafaxson AI. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList<ChatMessageItem>>(null);

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const userMessage: ChatMessageItem = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Convert messages to API format
      const conversationHistory: ChatMessage[] = messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }));

      // Call API service
      const result = await sendChatMessage(messageText, conversationHistory);

      if (result.success && result.data?.message) {
        const botMessage: ChatMessageItem = {
          id: (Date.now() + 1).toString(),
          text: result.data.message,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Enhanced error handling - show specific error message
        const errorMsg = result.error || "Failed to get response";
        
        // Log error for debugging
        console.error("Chat API Error:", errorMsg);
        
        // Show detailed error alert
        Alert.alert(
          "Chat Error", 
          errorMsg,
          [
            {
              text: "OK",
              style: "default",
            },
            // Show setup guide link if it's a deployment/config error
            ...(errorMsg.includes("not deployed") || errorMsg.includes("not configured")
              ? [{
                  text: "View Setup Guide",
                  onPress: () => {
                    // In a real app, you might navigate to a help page
                    console.log("See EDGE_FUNCTION_SETUP_GUIDE.md for setup instructions");
                  },
                }]
              : []),
          ]
        );

        // Add user-friendly error message to chat
        const errorBotMessage: ChatMessageItem = {
          id: (Date.now() + 1).toString(),
          text: errorMsg.includes("not deployed") || errorMsg.includes("not configured")
            ? "⚠️ The chat service needs to be configured. Please check the setup guide."
            : "I'm sorry, I'm having trouble responding right now. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorBotMessage]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      
      console.error("Chat Error (catch):", errorMessage);
      
      Alert.alert("Error", `Failed to send message: ${errorMessage}`);

      // Add error message to chat
      const errorBotMessage: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      if (isRecording && recording) {
        // Stop recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);

        if (uri) {
          setIsLoading(true);
          // Transcribe audio
          const result = await transcribeAudio(uri);

          if (result.success && result.data?.text) {
            setInputText(result.data.text);
            // Auto-send the transcribed message
            setTimeout(() => {
              handleSend();
            }, 100);
          } else {
            Alert.alert(
              "Transcription Error",
              result.error || "Failed to transcribe audio. Please try again."
            );
          }
          setIsLoading(false);
        }
      } else {
        // Start recording
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "Microphone permission is required for voice input."
          );
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Voice input failed: ${errorMessage}`);
      setIsRecording(false);
      setRecording(null);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: ChatMessageItem }) => (
    <View
      className={`flex-row mb-4 ${
        item.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {item.sender === "bot" && (
        <View className="bg-blue-100 rounded-full p-2 mr-2">
          <Bot size={20} color="#3B82F6" />
        </View>
      )}
      <View
        className={`max-w-[80%] rounded-2xl p-4 ${
          item.sender === "user"
            ? "bg-blue-500 rounded-tr-none"
            : "bg-gray-100 rounded-tl-none"
        }`}
      >
        <Text
          className={`text-base ${
            item.sender === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          {item.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            item.sender === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
      {item.sender === "user" && (
        <View className="bg-gray-200 rounded-full p-2 ml-2">
          <User size={20} color="#4B5563" />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 p-4">
        <View className="flex-row items-center">
          <View className="bg-blue-500 rounded-full p-2 mr-3">
            <Bot size={24} color="white" />
          </View>
          <View>
            <Text className="text-white text-xl font-bold">Mafaxson AI</Text>
            <Text className="text-blue-100 text-sm">
              Online â€¢ Ready to help
            </Text>
          </View>
        </View>
      </View>

      {/* Chat History */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Input Area */}
        <View className="border-t border-gray-200 p-3 bg-white">
          <View className="flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 rounded-full py-3 px-4 text-gray-800"
              multiline
            />
            <TouchableOpacity
              onPress={handleVoiceInput}
              className={`ml-2 p-3 rounded-full ${
                isRecording ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <Mic size={24} color={isRecording ? "white" : "#4B5563"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              className="ml-2 bg-blue-500 p-3 rounded-full"
              disabled={isLoading || inputText.trim() === ""}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
          {isRecording && (
            <View className="mt-2 items-center">
              <Text className="text-red-500 font-medium">
                Recording... Tap mic to stop
              </Text>
            </View>
          )}
          {isLoading && !isRecording && (
            <View className="mt-2 items-center">
              <Text className="text-blue-500 font-medium">Thinking...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
