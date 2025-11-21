/**
 * Supabase Edge Function: Translate Text
 *
 * This function handles text translation using OpenAI GPT API.
 * The OpenAI API key is stored securely in Supabase Edge Functions secrets.
 *
 * To deploy:
 * 1. Set the OPENAI_API_KEY secret: supabase secrets set OPENAI_API_KEY=your_key_here
 * 2. Deploy the function: supabase functions deploy translate
 *
 * Usage:
 * POST /functions/v1/translate
 * Body: { text: string, targetLanguage: string }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface RequestBody {
  text: string;
  targetLanguage: string;
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
    const { text, targetLanguage }: RequestBody = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Target language is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If target language is English, return original text
    if (
      targetLanguage.toLowerCase() === "english" ||
      targetLanguage.toLowerCase() === "en"
    ) {
      return new Response(
        JSON.stringify({
          translatedText: text,
          sourceLanguage: "auto",
          targetLanguage: "en",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Call OpenAI API for translation
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text into ${targetLanguage} while keeping the meaning accurate and natural. Only return the translated text, nothing else.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.error?.message || "Translation failed" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim() || text;

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLanguage: "auto",
        targetLanguage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
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
