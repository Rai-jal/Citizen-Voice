/**
 * API Service for backend API calls
 * Handles all API communication with Supabase Edge Functions
 * Note: OpenAI API key is now on the backend, not in client code
 */

import { supabase } from "./supabase";

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Transcription response
export interface TranscriptionResponse {
  text: string;
}

// Chat message
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Chat response
export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Translation response
export interface TranslationResponse {
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

/**
 * Transcribe audio using Supabase Edge Function
 * The OpenAI API key is stored securely in Supabase Edge Functions
 */
export async function transcribeAudio(
  audioUri: string
): Promise<APIResponse<TranscriptionResponse>> {
  try {
    // Read the audio file
    const response = await fetch(audioUri);
    const blob = await response.blob();

    // Convert blob to base64 for Edge Function
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64 = base64String.includes(",")
          ? base64String.split(",")[1]
          : base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const base64Audio = await base64Promise;

    // Get file extension from URI
    const extension = audioUri.split(".").pop() || "m4a";

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke(
      "transcribe-audio",
      {
        body: {
          audio: base64Audio,
          format: extension,
        },
      }
    );

    if (error) {
      // Enhanced error handling
      let errorMessage = error.message || "Failed to transcribe audio";

      if (
        error.message?.includes("Function not found") ||
        error.message?.includes("404") ||
        error.message?.toLowerCase().includes("not found")
      ) {
        errorMessage =
          "Transcribe function is not deployed. Please deploy the Edge Function first.";
      }

      if (
        data?.error?.includes("OPENAI_API_KEY") ||
        data?.error?.includes("not configured")
      ) {
        errorMessage =
          "OpenAI API key not configured. Please set the OPENAI_API_KEY secret in Supabase.";
      }

      if (data?.error) {
        errorMessage = data.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check if data contains an error
    if (data?.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      data: {
        text: data.text || "",
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return {
      success: false,
      error: `Transcription failed: ${errorMessage}`,
    };
  }
}

/**
 * Send chat message to AI assistant using Supabase Edge Function
 * The OpenAI API key is stored securely in Supabase Edge Functions
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<APIResponse<ChatResponse>> {
  try {
    const { data, error } = await supabase.functions.invoke("chat", {
      body: {
        message,
        history: conversationHistory,
      },
    });

    if (error) {
      // Enhanced error handling - check for specific error messages
      let errorMessage = error.message || "Failed to send chat message";

      // Check if the error indicates the function doesn't exist or isn't deployed
      if (
        error.message?.includes("Function not found") ||
        error.message?.includes("404") ||
        error.message?.toLowerCase().includes("not found")
      ) {
        errorMessage =
          "Chat function is not deployed. Please deploy the Edge Function first. See setup guide for details.";
      }

      // Check if the error indicates missing API key
      if (
        data?.error?.includes("OPENAI_API_KEY") ||
        data?.error?.includes("not configured")
      ) {
        errorMessage =
          "OpenAI API key not configured. Please set the OPENAI_API_KEY secret in Supabase. See setup guide for details.";
      }

      // If data contains an error property, use that
      if (data?.error) {
        errorMessage = data.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check if data contains an error (Edge Function returned 200 but with error in body)
    if (data?.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      data: {
        message: data.message || "",
        usage: data.usage,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return {
      success: false,
      error: `Chat failed: ${errorMessage}`,
    };
  }
}

/**
 * Translate text using Supabase Edge Function
 * The OpenAI API key is stored securely in Supabase Edge Functions
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<APIResponse<TranslationResponse>> {
  try {
    if (targetLanguage === "English" || targetLanguage === "en") {
      return {
        success: true,
        data: {
          translatedText: text,
          targetLanguage,
        },
      };
    }

    const { data, error } = await supabase.functions.invoke("translate", {
      body: {
        text,
        targetLanguage,
      },
    });

    if (error) {
      // Enhanced error handling
      let errorMessage = error.message || "Failed to translate text";

      if (
        error.message?.includes("Function not found") ||
        error.message?.includes("404") ||
        error.message?.toLowerCase().includes("not found")
      ) {
        errorMessage =
          "Translate function is not deployed. Please deploy the Edge Function first.";
      }

      if (
        data?.error?.includes("OPENAI_API_KEY") ||
        data?.error?.includes("not configured")
      ) {
        errorMessage =
          "OpenAI API key not configured. Please set the OPENAI_API_KEY secret in Supabase.";
      }

      if (data?.error) {
        errorMessage = data.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check if data contains an error
    if (data?.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      data: {
        translatedText: data.translatedText || text,
        sourceLanguage: data.sourceLanguage,
        targetLanguage,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return {
      success: false,
      error: `Translation failed: ${errorMessage}`,
    };
  }
}
