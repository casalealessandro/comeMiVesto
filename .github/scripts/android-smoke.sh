#!/usr/bin/env bash
set -euo pipefail

APK="android/app/build/outputs/apk/release/app-release.apk"
PACKAGE="com.acasale.comemivesto"
APP_LINK="https://comemivesto.app/detail-outfit/1"

test -f "$APK"
adb install -r "$APK"

adb logcat -c
adb shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1
sleep 8

PID="$(adb shell pidof "$PACKAGE" | tr -d '\r')"
test -n "$PID"
echo "ComeMiVesto running with PID $PID"

if adb logcat -d | grep -E "FATAL EXCEPTION|Process: ${PACKAGE//./\\.}.*AndroidRuntime"; then
  echo "Android crash detected"
  exit 1
fi

adb shell pm verify-app-links --re-verify "$PACKAGE" || true
sleep 12
adb shell pm get-app-links "$PACKAGE" | tee /tmp/app-links.txt

adb shell am start -W \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$APP_LINK"
sleep 3

adb shell dumpsys activity activities | grep -m1 "mResumedActivity\|topResumedActivity" | tee /tmp/resumed.txt
grep -q "$PACKAGE" /tmp/resumed.txt

if adb logcat -d | grep -E "FATAL EXCEPTION|Process: ${PACKAGE//./\\.}.*AndroidRuntime"; then
  echo "Android crash detected after App Link"
  exit 1
fi

echo "Android smoke test passed"
