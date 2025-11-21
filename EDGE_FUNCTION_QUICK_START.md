# Edge Functions - Quick Start Guide

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] An active Supabase project
- [ ] An OpenAI API key (get from https://platform.openai.com/api-keys)
- [ ] Terminal/Command line access

---

## 🚀 Setup Steps (5 Minutes)

### **Step 1: Install Supabase CLI**

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify Installation:**
```bash
supabase --version
```

✅ **Expected Output:** `supabase version X.X.X`

---

### **Step 2: Login to Supabase**

```bash
supabase login
```

✅ **Expected:** Browser opens → Login → Return to terminal

---

### **Step 3: Link Your Project**

1. **Get your Project Reference ID:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **General**
   - Copy the **Reference ID** (e.g., `abcdefghijklmnop`)

2. **Link the project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF_ID
   ```

   **Example:**
   ```bash
   supabase link --project-ref abcdefghijklmnop
   ```

✅ **Expected Output:** `Finished supabase link.`

---

### **Step 4: Set OpenAI API Key Secret** ⚠️ **CRITICAL**

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Important:**
- Replace `sk-your-actual-openai-api-key-here` with your real API key
- Key should start with `sk-`
- No spaces around `=`

**Verify Secret is Set:**
```bash
supabase secrets list
```

✅ **Expected Output:** You should see `OPENAI_API_KEY` in the list

---

### **Step 5: Deploy Edge Functions**

Deploy all three functions (one by one):

```bash
# Deploy Chat Function (for AI chatbot)
supabase functions deploy chat

# Deploy Transcribe Audio Function (for voice input)
supabase functions deploy transcribe-audio

# Deploy Translate Function (for translation)
supabase functions deploy translate
```

✅ **Expected Output for each:**
```
Deploying chat (project ref: abcdefghijklmnop)
Function chat deployed successfully
```

---

### **Step 6: Verify Deployment**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Edge Functions** in the left sidebar
4. You should see three functions:
   - ✅ `chat`
   - ✅ `transcribe-audio`
   - ✅ `translate`

---

## ✅ Verification Test

Test the chat function with curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test"}'
```

**Replace:**
- `YOUR_PROJECT_REF` with your project reference ID
- `YOUR_ANON_KEY` with your Supabase anon key (from Dashboard → Settings → API)

✅ **Expected Response:**
```json
{
  "message": "Hello! How can I help you today?",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}
```

---

## 🔄 After Setup: Restart Your App

After deploying Edge Functions, restart your Expo app:

```bash
# Stop current app (Ctrl+C)
# Then restart
npm start
# or
npx expo start
```

---

## 📊 Complete Setup Checklist

Use this checklist to verify everything is set up:

- [ ] Supabase CLI installed (`supabase --version` works)
- [ ] Logged in to Supabase (`supabase login` successful)
- [ ] Project linked (`supabase link` successful)
- [ ] OpenAI API key secret set (`supabase secrets list` shows `OPENAI_API_KEY`)
- [ ] All three functions deployed:
  - [ ] `chat`
  - [ ] `transcribe-audio`
  - [ ] `translate`
- [ ] Functions visible in Supabase Dashboard → Edge Functions
- [ ] App restarted after deployment
- [ ] Test message in chatbot works

---

## 🐛 Common Issues & Quick Fixes

### ❌ Error: "Function not found"
**Fix:** Deploy the function:
```bash
supabase functions deploy chat
```

### ❌ Error: "OPENAI_API_KEY not configured"
**Fix:** Set the secret and redeploy:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase functions deploy chat
```

### ❌ Error: "Unauthorized"
**Fix:** Check your `.env` file has correct Supabase URL and anon key

### ❌ Error: Still not working
**Fix:** Check function logs:
```bash
supabase functions logs chat
```

---

## 📝 Quick Reference Commands

```bash
# Check status
supabase --version
supabase secrets list

# Deploy functions
supabase functions deploy chat
supabase functions deploy transcribe-audio
supabase functions deploy translate

# View logs
supabase functions logs chat
supabase functions logs chat --tail

# Update secret (if needed)
supabase secrets set OPENAI_API_KEY=sk-new-key
supabase functions deploy chat  # Must redeploy after secret change
```

---

## 🎯 What Each Function Does

| Function | Purpose | Used In |
|----------|---------|---------|
| `chat` | AI chatbot conversations | Mafaxson AI chatbot screen |
| `transcribe-audio` | Convert voice to text | Voice input in chatbot |
| `translate` | Translate text to different languages | Translation feature |

---

## 📚 Need More Help?

- **Detailed Troubleshooting:** See [EDGE_FUNCTION_SETUP_GUIDE.md](./EDGE_FUNCTION_SETUP_GUIDE.md)
- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Function Logs:** `supabase functions logs chat`

---

**Setup Time:** ~5 minutes  
**Last Updated:** Based on CitizenVoice app structure

