# Deploy Edge Functions NOW - Copy & Paste Guide

## ✅ Pre-Check: You Have Everything Ready
- ✅ Supabase CLI installed (v2.58.5)
- ✅ Three Edge Functions ready to deploy (`chat`, `transcribe-audio`, `translate`)
- ✅ App code configured to use these functions

---

## 📝 **What You Need Before Starting**

1. **Your Supabase Project Reference ID**
   - Go to: https://supabase.com/dashboard
   - Click on your project
   - Go to: **Settings** → **General**
   - Copy the **Reference ID** (looks like: `abc123xyz`)

2. **Your OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Create a new key or use existing one
   - Copy it (starts with `sk-`)

---

## 🚀 **Deployment Commands - Run in Your Terminal**

Open your terminal app (not in Cursor) and run these commands:

### **STEP 1: Login to Supabase**

```bash
cd ~/Desktop/citizenvoice
supabase login
```

This will open your browser for authentication. Follow the prompts.

---

### **STEP 2: Link Your Project**

Replace `YOUR_PROJECT_REF` with your actual project reference ID:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Example:**
```bash
supabase link --project-ref abc123xyz
```

When prompted for the database password, use your Supabase database password (from project settings).

---

### **STEP 3: Set OpenAI API Key Secret**

Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key:

```bash
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

**Example:**
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-abc123xyz...
```

This stores the key securely on Supabase's servers (NOT in your code).

---

### **STEP 4: Deploy All Three Functions**

```bash
# Deploy chat function
supabase functions deploy chat

# Deploy transcribe-audio function
supabase functions deploy transcribe-audio

# Deploy translate function
supabase functions deploy translate
```

Each deployment takes about 10-30 seconds. You'll see output like:
```
Deploying Function... (project-ref = abc123xyz)
✓ Deployed Function chat successfully
```

---

## ✅ **STEP 5: Test the Deployment**

### Test the Chat Function

Get your **Anon Key**:
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api
- Copy the `anon` `public` key

Then test:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, this is a test!"}'
```

**Expected Response:**
```json
{
  "message": "Hello! How can I help you today?",
  "success": true
}
```

---

## 🎉 **Success Indicators**

You'll know it worked if you see:

1. **During Deployment:**
   ```
   ✓ Deployed Function chat successfully
   ✓ Deployed Function transcribe-audio successfully
   ✓ Deployed Function translate successfully
   ```

2. **Test Response:**
   - Chat function returns a message from OpenAI
   - No error messages about "Function not found" or "OPENAI_API_KEY"

---

## 🔍 **Verify in Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions
2. You should see three functions listed:
   - `chat`
   - `transcribe-audio`
   - `translate`
3. Each should show a green "Deployed" status

---

## ⚠️ **Common Issues & Solutions**

### Issue: "Project not linked"
**Solution:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: "Invalid database password"
**Fix:**
- Go to: Dashboard → Settings → Database
- Reset your database password if needed
- Use that password when linking

### Issue: "Function not found" after deployment
**Fix:**
- Wait 1-2 minutes for functions to fully propagate
- Check dashboard to confirm deployment status
- Redeploy if needed: `supabase functions deploy chat`

### Issue: "OPENAI_API_KEY not configured" in response
**Fix:**
```bash
# Verify secret is set
supabase secrets list

# If not there, set it again
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### Issue: "Non-2xx status code"
**Causes:**
1. OpenAI API key not set or invalid
2. OpenAI API key has no credits
3. Function deployment incomplete

**Fix:**
- Check your OpenAI account has credits: https://platform.openai.com/usage
- Verify secret: `supabase secrets list`
- Redeploy functions

---

## 📱 **Test in Your App**

After successful deployment:

1. **Start your app:**
   ```bash
   cd ~/Desktop/citizenvoice
   npm start
   ```

2. **Test these features:**
   - Open the **Mafaxson** tab (AI Chat)
   - Type a message → Should get AI response
   - Try voice input → Should transcribe speech
   - Try translation → Should translate text

---

## 📊 **Monitor Function Logs**

To see real-time logs (helpful for debugging):

```bash
# Chat function logs
supabase functions logs chat

# Transcribe function logs
supabase functions logs transcribe-audio

# Translate function logs
supabase functions logs translate
```

Press `Ctrl+C` to stop watching logs.

---

## 🎯 **What's Next After Edge Functions Deploy?**

1. ✅ **Edge Functions Deployed** ← You're doing this now
2. ⏳ **Build Production Apps** ← Next (1-2 hours)
   ```bash
   eas build -p ios --profile production
   eas build -p android --profile production
   ```
3. ⏳ **Device Testing** (1-2 hours)
4. ⏳ **Create Screenshots** (2-3 hours)
5. ⏳ **Submit to Stores** (1-2 hours)

**You're on track to launch in 2-4 days!** 🚀

---

## 💡 **Pro Tips**

1. **Check Function Invocations:**
   - Dashboard → Functions → Select function → View invocations and errors

2. **Update a Function:**
   - Just edit the file in `supabase/functions/[name]/index.ts`
   - Redeploy: `supabase functions deploy [name]`

3. **Delete a Function:**
   ```bash
   supabase functions delete [name]
   ```

4. **List All Secrets:**
   ```bash
   supabase secrets list
   ```

---

## 📞 **Need Help?**

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Supabase Discord:** https://discord.supabase.com
- **OpenAI Docs:** https://platform.openai.com/docs

---

## ✅ **Deployment Checklist**

Before you move to the next step, verify:

- [ ] Logged into Supabase CLI
- [ ] Project linked successfully
- [ ] OpenAI API key secret set
- [ ] All 3 functions deployed (chat, transcribe-audio, translate)
- [ ] Test curl command returned AI response
- [ ] Functions visible in Supabase dashboard
- [ ] App's AI chat feature works

---

**Last Updated:** November 25, 2025
**Status:** Ready to deploy - follow steps above! 🎯

