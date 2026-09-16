# iOS TestFlight CI

ComeMiVesto can be built and uploaded to TestFlight without a local Mac by using the GitHub Actions macOS runner.

## Current application identity

- Bundle ID: `com.acasale.comemivesto`
- Apple Team ID: `Z9SD7XVK87`
- Commercial version comes from a neutral `release-vX.Y.Z` tag.
- iOS build numbers are independent and tracked with `ios-vX.Y.Z-buildN` tags.
- The first CI build starts after the historical App Store Connect build 7, so the initial generated build is 8.

## Required GitHub secrets

Already used for App Store Connect authentication:

- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`

Required for the native Firebase iOS build:

- `IOS_GOOGLE_SERVICE_INFO_PLIST_BASE64`

The Firebase plist must be the `GoogleService-Info.plist` for the iOS app with bundle ID `com.acasale.comemivesto`. The workflow restores it only on the temporary macOS runner, adds it to the Xcode App target resources, and removes it at the end.

No `.p8`, `.p12`, `.mobileprovision`, or `GoogleService-Info.plist` file must be committed.

## Apple signing

The Xcode project already uses automatic signing and Team `Z9SD7XVK87`. The workflow authenticates `xcodebuild` with the App Store Connect API key and `-allowProvisioningUpdates`, so Xcode can use Apple cloud-managed distribution signing when the API key has the required provisioning/signing permissions.

The TestFlight archive is built with the production `aps-environment` entitlement. The App ID in Apple Developer must therefore have Push Notifications enabled.

## Firebase / APNs

Before testing real FCM delivery on the TestFlight build:

1. Firebase must contain the iOS app `com.acasale.comemivesto`.
2. Its `GoogleService-Info.plist` must be stored in the GitHub secret above.
3. An APNs authentication key must be configured in Firebase Cloud Messaging for the Apple team.

The APNs `.p8` key stays in Firebase/Apple configuration and is not stored in this repository.

## Run

The workflow is manual: **Come Mi Vesto iOS TestFlight**.

For the current test use `release-v1.1.0`. The workflow:

1. checks out the neutral release tag;
2. calculates the next iOS build number;
3. builds Angular/Ionic and runs `npx cap sync ios`;
4. restores the Firebase plist and push entitlement only on the runner;
5. archives and exports the signed IPA with automatic signing;
6. validates and uploads the IPA to App Store Connect/TestFlight;
7. creates the corresponding `ios-vX.Y.Z-buildN` tag only after a successful upload.

After Apple finishes processing the build, install it through TestFlight on a physical iPhone and run the notification end-to-end checklist in `docs/push-notifications.md`.
