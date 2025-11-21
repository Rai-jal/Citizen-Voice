/**
 * Supabase Edge Function: Chat
 *
 * This function handles AI chatbot conversations using OpenAI GPT API.
 * The OpenAI API key is stored securely in Supabase Edge Functions secrets.
 *
 * To deploy:
 * 1. Set the OPENAI_API_KEY secret: supabase secrets set OPENAI_API_KEY=your_key_here
 * 2. Deploy the function: supabase functions deploy chat
 *
 * Usage:
 * POST /functions/v1/chat
 * Body: { message: string, history: ChatMessage[] }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
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
    const { message, history = [] }: RequestBody = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are Mafaxson AI, a helpful assistant for the CitizenVoice app. You help citizens with questions about government services, news, opportunities, and reporting issues. Be friendly, concise, and helpful.",
      },
      ...history.slice(-10), // Keep last 10 messages for context
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.error?.message || "Chat failed" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        usage: data.usage,
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
