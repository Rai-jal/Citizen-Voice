import { Bot, Mic, Send, User } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MafaxsonChatbot() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm Mafaxson AI. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "I need help with my account settings",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: "3",
      text: "Sure, I can help with that. Could you tell me more about the specific issue you're facing?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message. I understand your concern. Let me check that for you.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      const voiceMessage = {
        id: Date.now().toString(),
        text: "This is a simulated voice message transcription.",
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, voiceMessage]);
    }, 2000);
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

  const renderMessage = ({ item }: { item: any }) => (
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
            >
              <Send size={24} color="white" />
            </TouchableOpacity>
          </View>
          {isRecording && (
            <View className="mt-2 items-center">
              <Text className="text-red-500 font-medium">Recording...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
