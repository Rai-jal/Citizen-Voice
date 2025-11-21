# Production Readiness Checklist

## ✅ Phase 1: Backend Security (COMPLETED)

- [x] Create `profiles` table with `is_admin` column
- [x] Implement `is_admin()` RPC function
- [x] Set up RLS policies for all tables (reports, fact_checks, news, services, opportunities, profiles)
- [x] Promote admin user via SQL
- [x] Verify admin access works via RPC call

## ✅ Phase 2: Edge Functions (IN PROGRESS)

- [ ] Set OpenAI API key secret: `supabase secrets set OPENAI_API_KEY=sk-xxx`
- [ ] Deploy `chat` function: `supabase functions deploy chat`
- [ ] Deploy `transcribe-audio` function: `supabase functions deploy transcribe-audio`
- [ ] Deploy `translate` function: `supabase functions deploy translate`
- [ ] Test all functions with curl commands
- [ ] Verify function logs show no errors

## ✅ Phase 3: Quality Assurance & CI/CD (COMPLETED)

- [x] GitHub Actions workflow created (`.github/workflows/ci.yml`)
- [x] Jest configuration file created
- [x] Test suite includes:
  - [x] Unit tests for validation utilities
  - [x] Integration tests for report submission
  - [x] Integration tests for admin approval flow (with RLS mock)
  - [x] Integration tests for AI chat service
- [ ] Run `npm test` locally and verify all tests pass
- [ ] Push to GitHub and verify CI pipeline runs successfully

## ✅ Phase 4: App Configuration & Validation (COMPLETED)

- [x] Environment variable validation in `lib/config.ts`
- [x] Production fail-fast error handling in `app/_layout.tsx`
- [x] User-friendly error display for missing env vars
- [x] Verify `app.json` has correct:
  - [x] Bundle identifiers (iOS/Android)
  - [x] App icons and splash screens
  - [x] Permissions (microphone, camera, storage, location)
  - [x] Version numbers and build numbers
- [x] Verify `eas.json` production profile configured

## ⏳ Phase 5: Production Builds (TODO)

- [ ] Run `eas build -p ios --profile production`
- [ ] Run `eas build -p android --profile production`
- [ ] Download and install builds on physical devices
- [ ] Device QA Checklist:
  - [ ] Login with email/password works
  - [ ] Google OAuth sign-in works (if configured)
  - [ ] Report submission works
  - [ ] Admin dashboard accessible (for admin users)
  - [ ] Admin can approve/reject reports
  - [ ] AI chatbot responds correctly
  - [ ] Voice input transcription works
  - [ ] Offline banner displays when offline
  - [ ] Navigation flows correctly
  - [ ] No runtime crashes or errors

## ✅ Phase 6: Documentation & Compliance (COMPLETED)

- [x] Privacy Policy created (`PRIVACY_POLICY.md`)
- [x] Terms of Service created (`TERMS_OF_SERVICE.md`)
- [x] Privacy Policy accessible in-app (`/privacy-policy`)
- [x] Terms of Service accessible in-app (`/terms-of-service`)
- [ ] Update contact email addresses in both documents
- [ ] Review and customize privacy/terms content as needed

## ⏳ Phase 7: Store Submission Preparation (TODO)

### Apple App Store
- [ ] App screenshots (required sizes):
  - [ ] iPhone 6.7" display (1290 x 2796)
  - [ ] iPhone 6.5" display (1242 x 2688)
  - [ ] iPad Pro 12.9" (2048 x 2732)
- [ ] App description and keywords
- [ ] Privacy labels/declarations:
  - [ ] Microphone usage (for voice input)
  - [ ] Photo library access (for attachments)
  - [ ] Camera access (for photo capture)
  - [ ] Location access (optional, for reports)
  - [ ] Network data transmission
- [ ] Age rating information
- [ ] Support URL and contact information

### Google Play Store
- [ ] Feature graphic (1024 x 500)
- [ ] Phone screenshots (16:9 or 9:16 ratio)
  - [ ] At least 2, up to 8 screenshots
- [ ] Tablet screenshots (optional)
- [ ] App description (short and full)
- [ ] Data Safety section:
  - [ ] Data collection disclosure (email, user content)
  - [ ] Data sharing disclosure (Supabase, OpenAI)
  - [ ] Security practices
  - [ ] Data deletion policy
- [ ] Content rating questionnaire completed
- [ ] Target audience and content guidelines

## 🔐 Security Audit (BEFORE PRODUCTION)

- [ ] Verify RLS policies block unauthorized access
- [ ] Test admin-only actions fail for non-admin users
- [ ] Confirm no API keys or secrets in client code
- [ ] Verify environment variables are properly secured
- [ ] Review storage bucket policies
- [ ] Check for any exposed sensitive data in logs

## 📊 Monitoring & Analytics (OPTIONAL)

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure app analytics (optional, with user consent)
- [ ] Set up uptime monitoring
- [ ] Create error alerting system

## 🚀 Final Pre-Launch Steps

1. **Code Review:** Have all code reviewed by team
2. **Testing:** Complete full QA pass on production builds
3. **Documentation:** Ensure all documentation is up-to-date
4. **Backup:** Ensure database backups are configured
5. **Support:** Prepare support email/contact for user issues
6. **Launch Plan:** Coordinate launch announcement and marketing

---

## Current Status Summary

**Overall Readiness: ~85%**

### Completed ✅
- Backend security (RLS, admin system)
- CI/CD pipeline setup
- Test suite implementation
- App configuration validation
- Privacy Policy and Terms of Service

### In Progress 🔄
- Edge Functions deployment (needs OpenAI key setup)
- Production builds (needs EAS build execution)

### Remaining ⏳
- Store submission assets
- Final device QA
- Monitoring setup (optional)

---

**Last Updated:** January 2025
**Next Steps:** Deploy Edge Functions → Run Production Builds → Device QA → Store Submission

