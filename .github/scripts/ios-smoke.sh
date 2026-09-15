#!/usr/bin/env bash
set -euo pipefail

DEVICE_ID="${1:?Missing simulator device id}"
DERIVED_DATA="${2:?Missing derived data path}"
BUNDLE_ID="com.acasale.comemivesto"
CUSTOM_LINK="comemivesto://outfit/smoke-test"
APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/App.app"

test -d "$APP_PATH"
test -f "$APP_PATH/Info.plist"

# The custom URL scheme is owned by the app and can be tested reliably on the
# simulator without depending on Apple's Universal Links association service.
plutil -p "$APP_PATH/Info.plist" | grep -q 'comemivesto'

xcrun simctl install "$DEVICE_ID" "$APP_PATH"

# Normal launch.
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"
sleep 5

# Warm custom deep link.
xcrun simctl openurl "$DEVICE_ID" "$CUSTOM_LINK"
sleep 2

# Cold custom deep link. App.getLaunchUrl() must handle this path on startup.
xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" || true
xcrun simctl openurl "$DEVICE_ID" "$CUSTOM_LINK"
sleep 4

# If the URL registration or app startup is broken this command will fail.
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"
sleep 2

echo "iOS simulator smoke test passed"
