# Test Your Edge Functions - Quick Fix

## ✅ Great News: All Functions Deployed Successfully!

Your project reference: `zvehlzzyzdytnuatdtpb`

Functions deployed:

- ✅ chat
- ✅ transcribe-audio
- ✅ translate

---

## 🔑 Get Your Anon Key (2 steps)

### Step 1: Open this URL in your browser:

```
https://supabase.com/dashboard/project/zvehlzzyzdytnuatdtpb/settings/api
```

### Step 2: Copy the "anon public" key

- Look for the section **Project API keys**
- Find the key labeled: `anon` `public`
- Click the copy icon
- It's a long string starting with `eyJ...`

---

## ✅ Test Your Chat Function

Replace `YOUR_ACTUAL_ANON_KEY` with the key you just copied:

```bash
curl -X POST https://zvehlzzyzdytnuatdtpb.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer YOUR_ACTUAL_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, this is a test!"}'
```

**Expected Response:**

```json
{
  "message": "Hello! How can I help you with...",
  "success": true
}
```

---

## 🎉 If You Get an AI Response: SUCCESS!

Your Edge Functions are working perfectly! You can now:

1. **Test in your app:**

   ```bash
   cd ~/Desktop/citizenvoice
   npm start
   ```

   Then open the **Mafaxson** tab and chat with the AI.

2. **Move to the next step: Build production apps!**

---

## ⚠️ If You Get Different Errors:

### Error: "OPENAI_API_KEY not configured"

**Fix:**

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key
```

### Error: "Insufficient credits" or "quota exceeded"

**Fix:** Check your OpenAI account has credits: https://platform.openai.com/usage

### Error: Still getting 401

**Fix:** Make sure you copied the FULL anon key (it's very long, starts with `eyJ`)

---

## 📱 Quick Test in Your App

The easiest way to verify everything works:

```bash
# Start your app
cd ~/Desktop/citizenvoice
npm start

# Press 'i' for iOS simulator or 'a' for Android
# Or scan QR code with Expo Go app
```

Then:

1. Open the **Mafaxson** tab (AI Chat)
2. Type a message
3. You should get an AI response!

---

## 🎯 Next Step: Production Builds

Once you confirm the Edge Functions work in your app, you're ready to build production versions:

```bash
# Install EAS CLI (if not already)
npm install -g eas-cli

# Login
eas login

# Build iOS
eas build -p ios --profile production

# Build Android
eas build -p android --profile production
```

Each build takes 10-30 minutes on Expo's servers.

---

**You're almost there! Just need to test with the real anon key.** 🚀
