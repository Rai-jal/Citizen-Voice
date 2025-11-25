# Fix Android Emulator Storage Issue

## ❌ **Error:**
```
INSTALL_FAILED_INSUFFICIENT_STORAGE: Failed to override installation location
```

## 🎯 **Solutions (Try in Order)**

---

### **Solution 1: Clear Emulator Cache (Fastest - 2 min)**

#### **Option A: From Android Studio**
1. Open Android Studio
2. Go to **Tools** → **Device Manager** (or **AVD Manager**)
3. Click the **▼** dropdown next to your emulator
4. Click **Wipe Data**
5. Confirm and restart emulator

#### **Option B: From Terminal**
```bash
# List all emulators
emulator -list-avds

# Wipe data for your emulator (replace with your emulator name)
cd ~/Library/Android/sdk/emulator
./emulator -avd Pixel_5_API_34 -wipe-data
```

---

### **Solution 2: Increase Emulator Storage (Recommended - 5 min)**

#### **Step 1: Open AVD Manager**
```bash
# From terminal
~/Library/Android/sdk/tools/bin/avdmanager list avd

# Or open Android Studio → Tools → Device Manager
```

#### **Step 2: Edit Emulator Storage**
1. In Device Manager, click **✏️ Edit** (pencil icon) on your emulator
2. Click **Show Advanced Settings**
3. Scroll to **Memory and Storage**
4. Increase **Internal Storage** to **4096 MB** (4GB) or more
5. Increase **SD Card** to **2048 MB** (2GB)
6. Click **Finish**
7. Restart the emulator

#### **Step 3: Verify Changes**
```bash
# Check emulator storage
adb shell df -h
```

---

### **Solution 3: Delete and Recreate Emulator (10 min)**

If the above doesn't work, create a fresh emulator with more storage:

#### **Step 1: Delete Old Emulator**
```bash
# List emulators
~/Library/Android/sdk/tools/bin/avdmanager list avd

# Delete old emulator
~/Library/Android/sdk/tools/bin/avdmanager delete avd -n YOUR_EMULATOR_NAME
```

#### **Step 2: Create New Emulator with More Storage**

**From Android Studio:**
1. **Tools** → **Device Manager** → **Create Device**
2. Select **Pixel 5** or similar (modern device)
3. Select **System Image**: **API 34** (Android 14)
4. Click **Show Advanced Settings**
5. Set **Internal Storage:** **4096 MB**
6. Set **SD Card:** **2048 MB**
7. Set **RAM:** **2048 MB** (or more if you have it)
8. Click **Finish**

**From Terminal:**
```bash
# Create new emulator with more storage
~/Library/Android/sdk/tools/bin/avdmanager create avd \
  -n Pixel_5_API_34 \
  -k "system-images;android-34;google_apis;arm64-v8a" \
  -d pixel_5 \
  -c 4096M

# Start it
~/Library/Android/sdk/emulator/emulator -avd Pixel_5_API_34
```

---

### **Solution 4: Clean Up Existing Emulator (5 min)**

If you want to keep your emulator but need space:

```bash
# Connect to emulator
adb shell

# Remove old apps
pm list packages | grep -v "com.google" | grep -v "com.android" | cut -d: -f2 | xargs -n1 pm uninstall

# Clear all app data
pm clear --all

# Exit
exit

# Clear emulator cache from host
adb shell pm clear com.google.android.gms
```

---

### **Solution 5: Uninstall Old APK First**

```bash
# List installed packages
adb shell pm list packages | grep citizenvoice

# Uninstall your app
adb uninstall com.rai.citizenvoice

# Then try installing again
cd ~/Desktop/citizenvoice
npm run android
```

---

### **Solution 6: Use Physical Device Instead**

If emulator keeps giving issues, use a real Android phone:

#### **Step 1: Enable Developer Options on Phone**
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**

#### **Step 2: Connect Phone**
```bash
# Connect phone via USB
# Check if detected
adb devices

# Should show:
# List of devices attached
# XXXXXXXXXXXXX    device

# Run app on phone
cd ~/Desktop/citizenvoice
npm run android
```

---

## 🔍 **Verify Storage After Fix**

```bash
# Check emulator storage
adb shell df -h

# Should see something like:
# /data        3.9G  1.2G  2.7G  31% /data

# If /data is > 90% full, you need more storage
```

---

## 💡 **Prevention Tips**

### **Keep Emulator Clean:**
```bash
# Periodically clear cache
adb shell pm trim-caches 999G

# Clear old logs
adb logcat -c

# Uninstall unused apps
adb shell pm list packages
adb uninstall <package-name>
```

### **Use Smaller APK:**
```bash
# Build smaller debug APK
cd ~/Desktop/citizenvoice
cd android
./gradlew assembleDebug --no-build-cache
```

---

## 🚀 **Recommended Emulator Settings**

For CitizenVoice app, use these settings:

| Setting | Recommended Value |
|---------|-------------------|
| Device | Pixel 5 or Pixel 6 |
| API Level | 34 (Android 14) |
| Internal Storage | **4096 MB** (4GB) |
| SD Card | 2048 MB (2GB) |
| RAM | 2048 MB (or more) |
| Graphics | Hardware (GLES 2.0) |

---

## ⚡ **Quick Command Reference**

```bash
# List emulators
emulator -list-avds

# Start emulator
emulator -avd YOUR_EMULATOR_NAME

# Wipe emulator data
emulator -avd YOUR_EMULATOR_NAME -wipe-data

# Check storage
adb shell df -h

# Uninstall app
adb uninstall com.rai.citizenvoice

# Clear cache
adb shell pm trim-caches 999G

# Check connected devices
adb devices
```

---

## 🎯 **Best Solution for You**

Based on your error, I recommend:

**Option 1 (Quickest):** Wipe emulator data
```bash
# Stop any running emulators
adb devices
adb -s emulator-5554 emu kill

# Wipe data
emulator -avd YOUR_EMULATOR_NAME -wipe-data

# Then try again
cd ~/Desktop/citizenvoice
npm run android
```

**Option 2 (Best long-term):** Increase emulator storage to 4GB in AVD Manager

**Option 3 (If in a hurry):** Use a physical Android device instead

---

**Choose the solution that works best for you!** 🚀

