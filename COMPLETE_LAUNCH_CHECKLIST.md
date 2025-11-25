# CitizenVoice - Complete Launch Checklist

## 🎯 Current Status: 95% Ready for Launch!

### ✅ What's Done:

- ✅ App fully built with all features
- ✅ Edge Functions deployed (`chat`, `transcribe-audio`, `translate`)
- ✅ Supabase authentication working
- ✅ Database with RLS policies
- ✅ Admin dashboard
- ✅ Git repository clean and secured

### ⏳ What's Left (2-3 hours):

1. Add OpenAI credits (5 min)
2. Test AI features (10 min)
3. Build production apps (1-2 hours)
4. Test on device (30 min)

---

## 📋 **STEP-BY-STEP ACTION PLAN**

### **STEP 1: Add OpenAI Credits** ⏱️ 5 minutes

#### 1.1 Go to OpenAI Billing

Open this link: https://platform.openai.com/settings/organization/billing/overview

#### 1.2 Add Payment Method

- Click **"Add payment method"**
- Enter your credit card details
- Save it

#### 1.3 Add Credits

- Click **"Add to credit balance"**
- Add **$5** (minimum) or more
- Confirm purchase

**Why $5 is enough:**

- Chat: ~$0.002 per message
- Translation: ~$0.001 per translation
- Transcription: ~$0.006 per minute
- **$5 = 2,000+ AI conversations!**

#### 1.4 Verify Credits Added

- Refresh the billing page
- You should see your balance: `$5.00`

---

### **STEP 2: Test Your Edge Functions** ⏱️ 10 minutes

#### 2.1 Test Chat Function

Run this in your terminal:

```bash
curl -X POST https://zvehlzzyzdytnuatdtpb.supabase.co/functions/v1/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZWhsenp5emR5dG51YXRkdHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzUwNjgsImV4cCI6MjA3MzQ1MTA2OH0.FWA3gTosvXDlF6hOwlFGuVwlECnBzTNmMcRf_27PWI8" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, this is a test!"}'
```

**Expected Success:**

```json
{
  "message": "Hello! I'm an AI assistant. How can I help you today?",
  "success": true
}
```

✅ If you see an AI response → **SUCCESS!** Your Edge Functions work!

---

#### 2.2 Test in Your App

```bash
cd ~/Desktop/citizenvoice
npm start
```

Then:

1. Press `i` for iOS simulator (or `a` for Android)
2. Login or register an account
3. Go to **Mafaxson** tab (AI Chat)
4. Send a message: "Hello!"
5. You should get an AI response!

**Also test:**

- Voice input (microphone icon) - tests `transcribe-audio`
- Translation feature - tests `translate`

---

### **STEP 3: Build Production Apps** ⏱️ 1-2 hours

#### 3.1 Install EAS CLI (if not installed)

```bash
npm install -g eas-cli
```

#### 3.2 Login to Expo

```bash
eas login
```

Use your Expo account credentials.

#### 3.3 Build iOS App

```bash
cd ~/Desktop/citizenvoice
eas build -p ios --profile production
```

**What happens:**

- Uploads your code to Expo servers
- Builds the iOS app in the cloud
- Takes 15-30 minutes
- You'll get a link to download the IPA file

**Output:**

```
✔ Build submitted!
Monitor: https://expo.dev/accounts/YOUR_ACCOUNT/projects/citizenvoice/builds/ABC123
```

#### 3.4 Build Android App

```bash
eas build -p android --profile production
```

**What happens:**

- Builds Android App Bundle (AAB)
- Takes 15-30 minutes
- You'll get a link to download the AAB file

**Output:**

```
✔ Build submitted!
Monitor: https://expo.dev/accounts/YOUR_ACCOUNT/projects/citizenvoice/builds/XYZ789
```

---

### **STEP 4: Download and Test Builds** ⏱️ 30 minutes

#### 4.1 Download Builds

Go to: https://expo.dev/accounts/YOUR_ACCOUNT/projects/citizenvoice/builds

**Download:**

- iOS: `citizenvoice-1.0.0.ipa`
- Android: `citizenvoice-1.0.0.aab`

#### 4.2 Install on Physical Devices

**For iOS:**

- Use TestFlight or Xcode to install IPA on iPhone
- Or use EAS: `eas build:run -p ios`

**For Android:**

- Use `adb` to install APK (if you built APK)
- Or upload AAB to Play Console internal testing
- Or use EAS: `eas build:run -p android`

#### 4.3 Test Checklist on Device

Test these features:

- [ ] App launches without crashes
- [ ] Login with email/password works
- [ ] Browse news, services, opportunities
- [ ] Submit a report with photo
- [ ] Submit a fact-check claim
- [ ] AI chat works (Mafaxson tab)
- [ ] Voice input works
- [ ] Translation works (if feature is visible)
- [ ] Admin dashboard (if you're admin)
- [ ] App works offline (shows offline banner)
- [ ] No major UI issues

**If any bugs:** Fix them, rebuild, test again.

---

### **STEP 5: Create Store Assets** ⏱️ 2-3 hours

#### 5.1 Take Screenshots

**For iPhone:**

- Open app on iPhone 14 Pro Max (or use simulator)
- Take 5-10 screenshots of:
  1. Home screen with news
  2. Report submission
  3. Fact-check screen
  4. AI chat interface
  5. Services/opportunities
  6. Admin dashboard (optional)

**Required sizes:**

- iPhone 6.7": 1290 x 2796 pixels
- iPhone 6.5": 1242 x 2688 pixels

**For Android:**

- Take 2-8 screenshots
- Recommended: 1080 x 1920 pixels

#### 5.2 Create Graphics

**Google Play Feature Graphic:**

- Size: 1024 x 500 pixels
- Format: PNG or JPG
- Use Canva, Figma, or Photoshop
- Show app name and key feature

**App Icon (if needed):**

- Size: 512 x 512 pixels
- Format: PNG

---

### **STEP 6: Submit to App Store** ⏱️ 1 hour

#### 6.1 App Store Connect

Go to: https://appstoreconnect.apple.com

**Create New App:**

- Click "My Apps" → "+" → "New App"
- Name: **CitizenVoice**
- Bundle ID: **com.rai.citizenvoice**
- SKU: **citizenvoice-001**
- Language: **English**

#### 6.2 Upload Build

Option A: Use EAS

```bash
eas submit -p ios --profile production
```

Option B: Manual upload via App Store Connect

#### 6.3 Complete App Information

**Category:** Social Networking or Utilities

**Description:**

```
CitizenVoice empowers citizens to actively participate in their communities through innovative technology and transparent communication.

KEY FEATURES:
• Report Issues: Submit detailed reports with photos, videos, and location
• Fact-Checking: Request verification of claims and access verified information
• Government Services: Discover and access available services
• AI Assistant: Get instant answers about services and procedures
• Voice Input: Hands-free interaction
• Multi-language Support: Access content in multiple languages

BENEFITS:
- Transparent government communication
- Quick issue reporting and tracking
- Verified information access
- Community engagement tools

Your privacy is our priority. All data is securely encrypted.
```

**Keywords:** citizen, government, report, fact-check, community, voice, engagement

**Support URL:** Your website or GitHub link

**Privacy Policy URL:**

- Host your `PRIVACY_POLICY.md` online
- Or use: `https://your-domain.com/privacy-policy`

#### 6.4 Upload Screenshots

Upload all your iPhone screenshots

#### 6.5 Complete Privacy Labels

**Data Collected:**

- Email address (for account)
- User content (reports, fact-checks)
- Location (optional, for reports)

**Data Usage:** App functionality (not for tracking)

**Third Parties:**

- Supabase (data storage)
- OpenAI (AI features)

#### 6.6 Submit for Review

- Review all information
- Click **"Submit for Review"**
- Average review time: **24-48 hours**

---

### **STEP 7: Submit to Play Store** ⏱️ 1 hour

#### 7.1 Play Console

Go to: https://play.google.com/console

**Create New App:**

- Click "Create app"
- App name: **CitizenVoice**
- Language: **English**
- App type: **App**
- Category: **Social**
- Free or Paid: **Free**

#### 7.2 Upload Build

Option A: Use EAS

```bash
eas submit -p android --profile production
```

Option B: Manual upload via Play Console

#### 7.3 Complete Store Listing

**Short description:**

```
Report issues, fact-check claims, and access government services
```

**Full description:**

```
CitizenVoice is your comprehensive platform for civic engagement. Connect with government services, report issues, and access verified information.

FEATURES:
✓ Issue Reporting with multimedia attachments
✓ Fact-Checking and verified information
✓ Government Services directory
✓ AI-Powered Assistant
✓ Voice Input support
✓ Multi-language Support

WHY CITIZENVOICE:
• Transparent government communication
• Easy-to-use interface
• Secure and private
• Anonymous reporting options

Download now and start engaging with your community!
```

#### 7.4 Upload Graphics

- Feature graphic: 1024 x 500 PNG
- App icon: 512 x 512 PNG
- Phone screenshots: At least 2

#### 7.5 Complete Data Safety Section (IMPORTANT!)

**Data collected:**

- ✓ Email address (account)
- ✓ User content (reports, claims)
- ✓ Device ID (app functionality)

**Data shared:**

- ✓ Supabase (storage)
- ✓ OpenAI (AI features)

**Security:**

- ✓ Data encrypted in transit
- ✓ Data encrypted at rest
- ✓ Users can request deletion

**Purpose:** App functionality, account management

#### 7.6 Content Rating

Complete the questionnaire:

- Expected rating: **Everyone** or **Teen**
- Depends on user-generated content moderation

#### 7.7 Submit for Review

- Review all sections
- Click **"Send for review"**
- Average review time: **1-3 days**

---

## 🎉 **LAUNCH DAY!**

After both stores approve:

1. **Apps go live automatically** (or you can schedule)
2. **Monitor reviews** and respond promptly
3. **Check analytics** in both store dashboards
4. **Share app links** with your community

**App Store Link Format:**

```
https://apps.apple.com/app/idXXXXXXXXX
```

**Play Store Link Format:**

```
https://play.google.com/store/apps/details?id=com.rai.citizenvoice
```

---

## 📊 **Timeline Summary**

| Task                 | Time        | When           |
| -------------------- | ----------- | -------------- |
| Add OpenAI credits   | 5 min       | ✅ Do now      |
| Test Edge Functions  | 10 min      | ✅ Do now      |
| Build iOS            | 30 min      | Today          |
| Build Android        | 30 min      | Today          |
| Device testing       | 30 min      | Today          |
| Create screenshots   | 2-3 hours   | Today/Tomorrow |
| Submit to App Store  | 1 hour      | Tomorrow       |
| Submit to Play Store | 1 hour      | Tomorrow       |
| **Apple Review**     | 24-48 hours | Days 2-3       |
| **Google Review**    | 1-3 days    | Days 2-4       |
| **LIVE ON STORES**   | —           | **Days 3-5**   |

**You could be live in 3-5 days!** 🚀

---

## ✅ **Quick Checklist**

Before submitting to stores, verify:

### Technical

- [ ] OpenAI credits added
- [ ] Edge Functions tested and working
- [ ] Production builds created
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device
- [ ] No crashes or critical bugs

### Legal

- [ ] Privacy Policy accessible online
- [ ] Terms of Service accessible online
- [ ] Support email configured

### Store Assets

- [ ] iPhone screenshots (6.7" and 6.5")
- [ ] Android screenshots (at least 2)
- [ ] Play Store feature graphic
- [ ] App descriptions written
- [ ] Keywords defined

### Store Configuration

- [ ] Bundle IDs correct: `com.rai.citizenvoice`
- [ ] Version: 1.0.0
- [ ] Privacy labels completed
- [ ] Data Safety section completed
- [ ] Content rating completed

---

## 🆘 **Need Help?**

- **OpenAI Issues:** https://help.openai.com
- **EAS Build Issues:** https://docs.expo.dev/build/introduction/
- **App Store Issues:** https://developer.apple.com/support/
- **Play Store Issues:** https://support.google.com/googleplay/android-developer

---

## 🎯 **YOUR IMMEDIATE NEXT STEPS:**

1. **Right now:** Add OpenAI credits → https://platform.openai.com/settings/organization/billing/overview
2. **In 5 min:** Test chat function with curl
3. **In 15 min:** Start iOS build: `eas build -p ios --profile production`
4. **In 20 min:** Start Android build: `eas build -p android --profile production`
5. **In 2 hours:** Download and test builds
6. **Tomorrow:** Take screenshots and submit to stores

---

**You're on the final stretch! Let's get CitizenVoice launched!** 🚀

**Last Updated:** November 25, 2025
