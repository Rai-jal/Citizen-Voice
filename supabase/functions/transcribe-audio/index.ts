/**
 * Supabase Edge Function: Transcribe Audio
 *
 * This function handles audio transcription using OpenAI Whisper API.
 * The OpenAI API key is stored securely in Supabase Edge Functions secrets.
 *
 * To deploy:
 * 1. Set the OPENAI_API_KEY secret: supabase secrets set OPENAI_API_KEY=your_key_here
 * 2. Deploy the function: supabase functions deploy transcribe-audio
 *
 * Usage:
 * POST /functions/v1/transcribe-audio
 * Body: { audio: base64String, format: "m4a" }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface RequestBody {
  audio: string; // Base64 encoded audio
  format?: string; // Audio format (m4a, wav, etc.)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Verify API key is set
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { audio, format = "m4a" }: RequestBody = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: "Audio data is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert base64 to buffer
    const audioBuffer = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));

    // Create form data for OpenAI API
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: `audio/${format}` });
    formData.append("file", blob, `audio.${format}`);
    formData.append("model", "whisper-1");
    formData.append("language", "en"); // Optional: detect language automatically

    // Call OpenAI API
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({
          error: error.error?.message || "Transcription failed",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify({ text: data.text || "" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
