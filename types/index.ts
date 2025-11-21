/**
 * Central export for all types
 */

export * from "./database";

// UI Component types
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// Navigation types
export interface NavigationParams {
  [key: string]: string | number | undefined;
}

// File upload types
export interface FileUpload {
  id: string;
  name: string;
  uri: string;
  type: "document" | "image" | "video" | "audio";
  size?: number;
}

// Search types
export interface SearchFilters {
  query: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Voice recording types
export interface VoiceRecording {
  uri: string;
  duration?: number;
  format: string;
}
