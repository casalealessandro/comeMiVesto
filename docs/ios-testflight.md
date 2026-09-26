# iOS TestFlight CI

ComeMiVesto can be built and uploaded to TestFlight without a local Mac by using the GitHub Actions macOS runner.

## Current application identity

- Bundle ID: `com.acasale.comemivesto`
- Apple Team ID: `Z9SD7XVK87`
- Commercial version comes from the `VERSION` file on `develop`.
- iOS build numbers are independent and tracked with `ios-vX.Y.Z-buildN` tags.
- The first CI build starts after the historical App Store Connect build 7, so the initial generated build is 8.

## Required GitHub secrets

Already used for App Store Connect authentication:

- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`

Required for the native Firebase iOS build:

- `IOS_GOOGLE_SERVICE_INFO_PLIST_BASE64`

The Firebase plist must be the `GoogleService-Info.plist` for the iOS app with bundle ID `com.acasale.comemivesto`. It must contain `CLIENT_ID` and `REVERSED_CLIENT_ID` for native Google Sign-In. The workflow restores it only on the temporary macOS runner and adds it to the Xcode App target resources.

Before the archive, the workflow derives `GIDClientID` and the Google URL scheme from that plist and writes them to the App target's `ios/App/App/Info.plist`. It validates the values against the source plist, preserves the existing `comemivesto` scheme, and checks the Firebase and Xcode bundle IDs. Repeated runs do not duplicate the Google scheme.

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

The TestFlight workflow belongs to `develop` and builds the exact `develop` commit that requests the test.

To request a TestFlight build, push a commit to `develop` whose commit message contains `[testflight]`, for example:

`ci: run iOS TestFlight [testflight]`

Normal pushes to `develop` do not upload anything to TestFlight because the job is skipped unless the marker is present.

The workflow:

1. checks out the triggering `develop` commit;
2. reads the commercial version from `VERSION`;
3. calculates the next iOS build number;
4. builds Angular/Ionic and runs `npx cap sync ios`;
5. restores the Firebase plist, derives and validates the native Google Sign-In configuration, and enables the push entitlement only on the runner;
6. archives and exports the signed IPA with automatic signing;
7. validates and uploads the IPA to App Store Connect/TestFlight;
8. creates the corresponding `ios-vX.Y.Z-buildN` tag only after a successful upload.

For a local macOS build, place the uncommitted Firebase plist at `ios/App/App/GoogleService-Info.plist`, run the web build and `npx cap sync ios`, then run `.github/scripts/configure-ios-google-sign-in.py` as documented in `docs/google-sign-in.md`. Open the workspace rather than the project. A physical iPhone and an OAuth Client iOS configured for `com.acasale.comemivesto` are required for the final native sign-in check.

After Apple finishes processing the build, install it through TestFlight on a physical iPhone and run the notification end-to-end checklist in `docs/push-notifications.md`.
