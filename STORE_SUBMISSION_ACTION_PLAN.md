# CitizenVoice - Complete Store Submission Action Plan

## 📊 Current Status: 85% Ready for Production

### ✅ What's Already Done
- Backend security (RLS policies, admin system)
- App configuration (icons, permissions, bundle IDs)
- CI/CD pipeline with tests
- Privacy Policy and Terms of Service
- Type-safe codebase with error handling

---

## 🚀 **ACTION PLAN: Steps to Launch**

### **STEP 1: Fix Git Secret Issue** ⚠️ **BLOCKING - DO THIS FIRST**

Your `.env` file with OpenAI API key is in Git history. GitHub is blocking all pushes.

**Quick Fix:**
```bash
# Option A: Simple removal (loses history)
rm -rf .git
git init
git remote add origin https://github.com/Rai-jal/Citizen-Voice.git
git add .
git commit -m "Fresh start - production ready"
git branch -M main
git push -u origin main --force
```

**OR Option B: Proper cleanup (see `FIX_GIT_SECRET.md` for detailed instructions)**

---

### **STEP 2: Deploy Edge Functions** (30 minutes)

Your AI chat, transcription, and translation features need Edge Functions deployed.

**2.1 Set OpenAI API Key Secret**
```bash
cd ~/Desktop/citizenvoice

# Login to Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Set OpenAI API key as secret
npx supabase secrets set OPENAI_API_KEY=sk-xxxYOUR_ACTUAL_KEYxxx
```

**2.2 Deploy Functions**
```bash
# Deploy all three functions
npx supabase functions deploy chat
npx supabase functions deploy transcribe-audio
npx supabase functions deploy translate
```

**2.3 Test Functions**
```bash
# Test chat function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

**Need the function code?** Check `EDGE_FUNCTION_QUICK_START.md`

---

### **STEP 3: Create Production Builds** (1-2 hours)

**3.1 Install EAS CLI**
```bash
npm install -g eas-cli
eas login
```

**3.2 Build for iOS**
```bash
eas build -p ios --profile production
```
This creates an IPA file for App Store submission.

**3.3 Build for Android**
```bash
eas build -p android --profile production
```
This creates an AAB (Android App Bundle) file for Play Store.

**3.4 Download and Test Builds**
- Download builds from https://expo.dev
- Install on physical devices
- Complete QA checklist (see below)

---

### **STEP 4: Device QA Testing** (1-2 hours)

Test on physical devices:
- [ ] Login with email/password works
- [ ] Report submission with photos/location works
- [ ] Fact-check submission works
- [ ] AI chatbot responds (after Edge Functions deployed)
- [ ] Voice input works
- [ ] Admin can access admin dashboard
- [ ] Admin can approve/reject reports and fact-checks
- [ ] Offline detection shows banner
- [ ] Navigation flows correctly
- [ ] No crashes or errors

---

### **STEP 5: Create Store Assets** (2-4 hours)

You need screenshots and graphics for both stores.

**5.1 iPhone Screenshots (Required)**
- Open app on iPhone 14 Pro Max or use simulator
- Take screenshots of:
  1. Home screen with news feed
  2. Report submission screen
  3. Fact-check screen
  4. AI chatbot interface
  5. Services/Opportunities screen

**Required Sizes:**
- iPhone 6.7": 1290 x 2796 pixels (at least 1 screenshot)
- iPhone 6.5": 1242 x 2688 pixels (at least 1 screenshot)

**5.2 Android Screenshots (Required)**
- Take 2-8 screenshots on Android device
- Ratio: 16:9 or 9:16
- Recommended: 1080 x 1920 pixels

**5.3 Google Play Feature Graphic (Required)**
- Create a banner graphic: 1024 x 500 pixels
- Use Figma, Canva, or Photoshop
- Should showcase app name and key feature

**5.4 High-Res App Icon**
- Export your icon as 512 x 512 PNG (no transparency)

---

### **STEP 6: Apple App Store Submission** (1-2 hours)

**6.1 App Store Connect Setup**
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Name:** CitizenVoice
   - **Bundle ID:** com.rai.citizenvoice
   - **SKU:** citizenvoice-001
   - **Primary Language:** English

**6.2 Upload Build**
```bash
eas submit -p ios --profile production
```
OR manually upload the IPA file via Xcode or App Store Connect.

**6.3 Complete App Information**
- **Category:** Social Networking
- **Subtitle:** Your platform for civic engagement
- **Description:** (see STORE_SUBMISSION_GUIDE.md)
- **Keywords:** citizen, government, report, fact-check, community, voice
- **Support URL:** https://citizenvoice.app/support (or your domain)
- **Privacy Policy URL:** https://citizenvoice.app/privacy-policy

**6.4 Upload Screenshots**
- Add iPhone 6.7" screenshots
- Add iPhone 6.5" screenshots
- Optionally add iPad screenshots

**6.5 Complete Privacy Labels**
- **Data Collected:**
  - Email Address (for account management)
  - User Content (reports, fact-checks)
- **Data Usage:** App functionality, not for tracking
- **Third Parties:** Supabase (data storage), OpenAI (AI features)

**6.6 Submit for Review**
- Review all information
- Click "Submit for Review"
- Average review time: 24-48 hours

---

### **STEP 7: Google Play Store Submission** (1-2 hours)

**7.1 Play Console Setup**
1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name:** CitizenVoice
   - **Default language:** English
   - **App type:** App
   - **Category:** Social
   - **Free or Paid:** Free

**7.2 Upload Build**
```bash
eas submit -p android --profile production
```
OR manually upload the AAB file via Play Console.

**7.3 Store Listing**
- **Short description:** "Report issues, fact-check claims, and access government services"
- **Full description:** (see STORE_SUBMISSION_GUIDE.md)
- **App icon:** 512 x 512 PNG
- **Feature graphic:** 1024 x 500 PNG
- **Phone screenshots:** At least 2 screenshots

**7.4 Complete Data Safety Section**
This is REQUIRED and very important.

**Data collected:**
- ✓ Email address (required for account)
- ✓ User-generated content (reports, claims)

**Data shared with third parties:**
- ✓ Supabase (database and auth)
- ✓ OpenAI (AI features)

**Security practices:**
- ✓ Data encrypted in transit (HTTPS)
- ✓ Data encrypted at rest
- ✓ Users can request deletion

**Purpose:**
- App functionality
- Account management

**7.5 Content Rating**
- Complete the content rating questionnaire
- Expected rating: Everyone (or Teen, depending on user-generated content)

**7.6 Submit for Review**
- Review all sections
- Click "Send for review"
- Average review time: 1-3 days

---

## 📋 **Pre-Submission Checklist**

### Technical
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Edge Functions deployed and tested
- [ ] Production builds created and tested on devices
- [ ] No runtime errors or crashes

### Legal & Compliance
- [ ] Privacy Policy URL accessible
- [ ] Terms of Service URL accessible
- [ ] Contact email configured in policies
- [ ] All permissions justified and necessary

### Store Assets
- [ ] iPhone screenshots (6.7" and 6.5")
- [ ] Android screenshots (at least 2)
- [ ] Google Play feature graphic
- [ ] App description written
- [ ] Keywords defined

### Store Configuration
- [ ] Bundle IDs match in code and store
- [ ] Version numbers correct (1.0.0)
- [ ] Privacy labels/data safety completed
- [ ] Content rating completed
- [ ] Support URL configured

---

## 🎯 **Estimated Timeline**

| Task | Time | Status |
|------|------|--------|
| Fix Git secret issue | 15 min | ⚠️ Blocking |
| Deploy Edge Functions | 30 min | 🔄 Ready |
| Create production builds | 1-2 hours | 🔄 Ready |
| Device QA testing | 1-2 hours | ⏳ After builds |
| Create store assets | 2-4 hours | ⏳ Pending |
| App Store submission | 1-2 hours | ⏳ Pending |
| Play Store submission | 1-2 hours | ⏳ Pending |
| **Total** | **8-13 hours** | |

**Plus review times:**
- Apple: 24-48 hours
- Google: 1-3 days

**Total time to launch: 2-4 days** (including reviews)

---

## 🆘 **Common Issues & Solutions**

### Issue: Edge Function returns 404
**Solution:** Function not deployed. Run `npx supabase functions deploy [function-name]`

### Issue: Build fails with "No development team"
**Solution:** Configure signing in EAS: `eas credentials`

### Issue: App rejected for missing privacy policy
**Solution:** Host `PRIVACY_POLICY.md` on a public URL and add to app.json

### Issue: RLS blocks data access
**Solution:** Check policies with `select * from pg_policies;` in Supabase SQL editor

---

## 📞 **Need Help?**

- **Expo/EAS Issues:** https://expo.dev/support
- **Supabase Issues:** https://supabase.com/support
- **App Store Issues:** https://developer.apple.com/support/
- **Play Store Issues:** https://support.google.com/googleplay/android-developer

---

## 🎉 **What to Do After Approval**

1. **Monitor:** Set up error tracking (Sentry)
2. **Engage:** Respond to user reviews
3. **Update:** Plan regular updates and bug fixes
4. **Market:** Share app link with your community
5. **Iterate:** Gather feedback and improve features

---

**Good luck with your launch! 🚀**

**Last Updated:** November 25, 2025

