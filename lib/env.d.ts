declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase (required)
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;

      // App Environment (optional, defaults to development)
      EXPO_PUBLIC_APP_ENV?: "development" | "staging" | "production";

      // OpenAI API Key should NOT be in client code
      // It should be in Supabase Edge Functions secrets or backend
      // OPENAI_API_KEY: string; // REMOVED - should be on backend only
    }
  }
}

export {};
