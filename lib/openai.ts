/**
 * DEPRECATED: OpenAI client-side usage
 *
 * ⚠️ SECURITY WARNING: This file is deprecated.
 * OpenAI API keys should NEVER be in client-side code.
 *
 * All OpenAI functionality has been moved to Supabase Edge Functions:
 * - Transcription: Use apiService.transcribeAudio()
 * - Chat: Use apiService.sendChatMessage()
 * - Translation: Use apiService.translateText()
 *
 * See lib/apiService.ts for the new implementation.
 */

// Re-export the API service functions for backward compatibility
export { translateText } from "./apiService";

// Note: The OpenAI client is no longer used in client code
// All AI operations are now handled by Supabase Edge Functions
// where the API key is stored securely
