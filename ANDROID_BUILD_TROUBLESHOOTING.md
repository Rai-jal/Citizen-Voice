# Android Build Troubleshooting Guide

## Current Issue: Gradle Build Failed

### Common Causes & Solutions

#### 1. **Check Full Build Logs**
The error message shows "unknown error" - you need to see the actual Gradle logs:

```bash
# Check build logs in EAS Dashboard
# Or locally if building with eas build --local
```

Look for specific errors like:
- `FAILURE: Build failed with an exception`
- Dependency resolution errors
- SDK version mismatches
- Memory errors (OutOfMemoryError)

---

#### 2. **New Architecture Issues**
Your app has `"newArchEnabled": true` which requires specific Gradle configuration.

**Option A: Disable New Architecture (Temporary Fix)**
```json
// app.json
{
  "expo": {
    "newArchEnabled": false  // Change to false
  }
}
```

**Option B: Keep New Architecture (Recommended Fix)**
Ensure your dependencies support it and Gradle is configured correctly.

---

#### 3. **Update EAS Build Configuration**
The `eas.json` has been updated with explicit Android build settings. Try building again:

```bash
eas build -p android --profile production
```

---

#### 4. **Clear Build Cache**
Sometimes cached Gradle files cause issues:

```bash
# Clear EAS build cache
eas build:configure

# Or rebuild from scratch
eas build -p android --profile production --clear-cache
```

---

#### 5. **Check SDK Versions**
Verify your Android SDK configuration in `app.json`:

```json
{
  "android": {
    "compileSdkVersion": 34,  // Add this if missing
    "targetSdkVersion": 34,   // Add this if missing
    "minSdkVersion": 21       // Add this if missing
  }
}
```

---

#### 6. **Memory/Resource Issues**
Gradle builds can fail due to memory limits. Add to `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "gradleCommand": ":app:bundleRelease",
        "env": {
          "GRADLE_OPTS": "-Xmx4096m -XX:MaxPermSize=512m"
        }
      }
    }
  }
}
```

---

#### 7. **Dependency Conflicts**
Check for conflicting package versions. Common issues:
- React Native version conflicts
- Expo SDK version mismatches
- Native module compatibility

Run:
```bash
npm ls react-native
npm ls expo
```

---

#### 8. **Missing Android Assets**
Ensure required files exist:
- `assets/images/adaptive-icon.png` (Android icon)
- `assets/images/splash-icon.png` (Splash screen)

---

#### 9. **Gradle Wrapper Issues**
If building locally, ensure Gradle wrapper is correct:

```bash
cd android
./gradlew --version
```

---

#### 10. **Try Preview Build First**
Before production build, test with preview:

```bash
eas build -p android --profile preview
```

---

## Quick Fix Steps (In Order)

1. **Update eas.json** (Already done - see updated file)
2. **Try building with clear cache:**
   ```bash
   eas build -p android --profile production --clear-cache
   ```
3. **If still failing, temporarily disable New Architecture:**
   - Set `"newArchEnabled": false` in `app.json`
   - Build again
   - If it works, the issue is with New Architecture compatibility
4. **Check EAS Dashboard logs:**
   - Go to https://expo.dev
   - Navigate to your project → Builds
   - Click on failed build
   - Check "Run gradlew" phase logs for specific error
5. **Verify all Android files are present:**
   ```bash
   # Ensure icon exists
   ls -la assets/images/adaptive-icon.png
   ls -la assets/images/icon.png
   ```

---

## Getting Detailed Error Messages

The error you're seeing is generic. To see the actual Gradle error:

1. **Via EAS Dashboard:**
   - Login to https://expo.dev
   - Go to your project
   - Click on the failed build
   - Expand the "Run gradlew" phase
   - Look for red error messages

2. **Via EAS CLI:**
   ```bash
   eas build:list
   # Get build ID, then:
   eas build:view [BUILD_ID]
   ```

3. **If building locally:**
   ```bash
   cd android
   ./gradlew assembleRelease --stacktrace
   ```

---

## Most Likely Issues

Based on common Expo/EAS build failures:

1. **New Architecture Compatibility** (60% chance)
   - Solution: Disable `newArchEnabled` temporarily

2. **Missing SDK Configuration** (20% chance)
   - Solution: Add `compileSdkVersion`, `targetSdkVersion` to `app.json`

3. **Icon/Asset Issues** (10% chance)
   - Solution: Verify all image files exist and are valid PNGs

4. **Dependency Version Conflicts** (10% chance)
   - Solution: Check package.json for conflicting versions

---

## Next Steps

1. Check the full build logs in EAS Dashboard (most important!)
2. Try the updated `eas.json` configuration
3. If needed, temporarily disable New Architecture
4. Share the specific Gradle error message for targeted fix

---

**Note:** Without seeing the actual Gradle error logs, this is general troubleshooting. The most helpful next step is to view the detailed build logs in the EAS Dashboard.

