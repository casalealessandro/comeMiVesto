#!/usr/bin/env bash
set -euo pipefail

APK="android/app/build/outputs/apk/release/app-release.apk"
PACKAGE="com.acasale.comemivesto"
CUSTOM_LINK="comemivesto://outfit/1"
APP_LINK="https://comemivesto.app/detail-outfit/1"

test -f "$APK"

# Keep the signing certificate visible in CI. App Links verification depends on
# this certificate matching one of the fingerprints published in assetlinks.json.
apksigner verify --print-certs "$APK" | tee /tmp/apk-certs.txt

adb install -r "$APK"
adb logcat -c

# Normal launch must stay alive.
adb shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1
sleep 8
PID="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
test -n "$PID"
echo "ComeMiVesto running with PID $PID"

if adb logcat -d | grep -E "FATAL EXCEPTION|Process: ${PACKAGE//./\\.}.*AndroidRuntime"; then
  echo "Android crash detected"
  exit 1
fi

# Custom scheme is app-owned and is therefore the reliable native routing smoke
# for a sideloaded CI APK. Test it both cold and warm.
adb shell am force-stop "$PACKAGE"
adb shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$CUSTOM_LINK" \
  "$PACKAGE"
sleep 4

adb shell dumpsys activity activities | grep -m1 "mResumedActivity\|topResumedActivity" | tee /tmp/custom-link-resumed.txt
grep -q "$PACKAGE" /tmp/custom-link-resumed.txt

adb shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$CUSTOM_LINK" \
  "$PACKAGE"
sleep 2

# Also prove that the HTTPS intent is accepted by ComeMiVesto when explicitly
# targeted. Whether Android selects it automatically depends on the certificate
# served by assetlinks.json (Play signing vs CI/upload signing), so domain
# verification is reported separately and is not a sideloaded-APK blocker.
adb shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$APP_LINK" \
  "$PACKAGE"
sleep 3

adb shell dumpsys activity activities | grep -m1 "mResumedActivity\|topResumedActivity" | tee /tmp/app-link-resumed.txt
grep -q "$PACKAGE" /tmp/app-link-resumed.txt

adb shell pm verify-app-links --re-verify "$PACKAGE" || true
sleep 5
adb shell pm get-app-links "$PACKAGE" | tee /tmp/app-links.txt || true

if adb logcat -d | grep -E "FATAL EXCEPTION|Process: ${PACKAGE//./\\.}.*AndroidRuntime"; then
  echo "Android crash detected after deep link smoke"
  exit 1
fi

echo "Android smoke test passed"
