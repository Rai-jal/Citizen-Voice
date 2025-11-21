# Supabase Edge Functions

This directory contains Supabase Edge Functions for handling AI operations securely on the backend.

## Functions

### 1. `transcribe-audio`

Transcribes audio files using OpenAI Whisper API.

**Endpoint:** `POST /functions/v1/transcribe-audio`

**Request Body:**

```json
{
  "audio": "base64EncodedAudioString",
  "format": "m4a"
}
```

**Response:**

```json
{
  "text": "Transcribed text"
}
```

### 2. `chat`

Handles AI chatbot conversations using OpenAI GPT API.

**Endpoint:** `POST /functions/v1/chat`

**Request Body:**

```json
{
  "message": "User message",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**

```json
{
  "message": "Assistant response",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### 3. `translate`

Translates text using OpenAI GPT API.

**Endpoint:** `POST /functions/v1/translate`

**Request Body:**

```json
{
  "text": "Text to translate",
  "targetLanguage": "Krio"
}
```

**Response:**

```json
{
  "translatedText": "Translated text",
  "sourceLanguage": "auto",
  "targetLanguage": "Krio"
}
```

## Setup

> ⚠️ **IMPORTANT:** If you're getting "non-2xx status code" errors, see the detailed setup guide: [`EDGE_FUNCTION_SETUP_GUIDE.md`](../../EDGE_FUNCTION_SETUP_GUIDE.md)

### Quick Setup

### 1. Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

Get your project reference ID from Supabase Dashboard → Settings → General → Reference ID

```bash
supabase link --project-ref your-project-ref
```

### 4. Set OpenAI API Key Secret

**CRITICAL:** This must be done before deploying functions.

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Verify:**
```bash
supabase secrets list
```

### 5. Deploy Functions

Deploy each function individually:

```bash
# Deploy the chat function (for AI chatbot)
supabase functions deploy chat

# Deploy the transcribe-audio function (for voice input)
supabase functions deploy transcribe-audio

# Deploy the translate function (for translation)
supabase functions deploy translate
```

**⚠️ Important:** After setting or updating secrets, you **must** redeploy the function:
```bash
supabase secrets set OPENAI_API_KEY=your-new-key
supabase functions deploy chat  # Must redeploy after secret change
```

### 6. Verify Deployment

Check Supabase Dashboard → Edge Functions to confirm all functions are deployed.

### 7. Test Functions

```bash
# Test transcription
curl -X POST https://your-project-ref.supabase.co/functions/v1/transcribe-audio \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"audio": "base64Audio", "format": "m4a"}'
```

## Security

- ✅ OpenAI API key is stored securely in Supabase Edge Functions secrets
- ✅ API key is never exposed to client-side code
- ✅ Functions require authentication via Supabase Auth
- ✅ CORS is properly configured
- ✅ Input validation is performed on all requests

## Environment Variables

The following secrets must be set in Supabase:

- `OPENAI_API_KEY` - Your OpenAI API key

## Local Development

To test functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve transcribe-audio --no-verify-jwt
supabase functions serve chat --no-verify-jwt
supabase functions serve translate --no-verify-jwt
```

## Monitoring

Monitor function usage and errors in the Supabase Dashboard:

- Go to Edge Functions section
- View logs and metrics
- Set up alerts for errors

## Cost Optimization

- Functions use GPT-4o-mini for cost efficiency
- Token limits are set to prevent excessive usage
- Consider implementing caching for frequently translated text
- Monitor API usage and set up rate limiting
