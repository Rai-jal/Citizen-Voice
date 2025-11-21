import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

// Create Supabase client with validated environment variables
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
