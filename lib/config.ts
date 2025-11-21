/**
 * Environment variable validation and configuration
 * Validates required environment variables at runtime
 */

// Type for environment variables
interface Env {
  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  EXPO_PUBLIC_APP_ENV: "development" | "staging" | "production";
}

// Validate individual environment variable
function validateEnvVar(
  key: string,
  value: string | undefined,
  isRequired = true
): string {
  if (!value && isRequired) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
        `Please check your .env file or environment configuration.`
    );
  }
  if (!value) return "";

  // Validate URL format for Supabase URL
  if (key === "EXPO_PUBLIC_SUPABASE_URL") {
    try {
      new URL(value);
    } catch {
      throw new Error(`❌ Invalid URL format for ${key}: ${value}`);
    }
  }

  return value;
}

// Get and validate environment variables
function getEnv(): Env {
  const supabaseUrl = validateEnvVar(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    true
  );

  const supabaseAnonKey = validateEnvVar(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    true
  );

  const appEnv = (process.env.EXPO_PUBLIC_APP_ENV ||
    "development") as Env["EXPO_PUBLIC_APP_ENV"];

  if (!["development", "staging", "production"].includes(appEnv)) {
    throw new Error(
      `❌ Invalid EXPO_PUBLIC_APP_ENV: ${appEnv}. Must be one of: development, staging, production`
    );
  }

  return {
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    EXPO_PUBLIC_APP_ENV: appEnv,
  };
}

// Validate and get environment variables
let env: Env;
try {
  env = getEnv();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // In development, we can continue but warn
    if (__DEV__) {
      console.warn(
        "⚠️ Continuing with invalid environment variables in development mode"
      );
      // Provide fallback values for development
      env = {
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
        EXPO_PUBLIC_SUPABASE_ANON_KEY:
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
        EXPO_PUBLIC_APP_ENV: "development",
      };
    } else {
      throw error;
    }
  } else {
    throw error;
  }
}

// Export validated environment variables
export const config = {
  supabase: {
    url: env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  app: {
    env: env.EXPO_PUBLIC_APP_ENV,
    isDevelopment: env.EXPO_PUBLIC_APP_ENV === "development",
    isProduction: env.EXPO_PUBLIC_APP_ENV === "production",
    isStaging: env.EXPO_PUBLIC_APP_ENV === "staging",
  },
} as const;

// Helper to check if required env vars are set
export function validateEnvironment(): void {
  if (!config.supabase.url || !config.supabase.anonKey) {
    const missing: string[] = [];
    if (!config.supabase.url) missing.push("EXPO_PUBLIC_SUPABASE_URL");
    if (!config.supabase.anonKey) missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");

    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env file or environment configuration.`
    );
  }
}

// Validate on import (only in production)
if (!__DEV__) {
  validateEnvironment();
}
