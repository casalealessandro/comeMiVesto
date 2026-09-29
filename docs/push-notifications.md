# Mobile push notification setup

The application registers authenticated Android and iOS installations with the existing Notification Core. A real push test still requires the platform configuration files and credentials that must stay outside the repository.

## Android

- Store the Base64-encoded Firebase Android configuration in the GitHub repository secret `ANDROID_GOOGLE_SERVICES_JSON_BASE64`. The Android CI jobs securely reconstruct and validate `android/app/google-services.json` before Capacitor sync, without printing or committing its contents.
- Local or non-GitHub secure build environments must likewise provide the Firebase project's `google-services.json` in `android/app/`; the file must never be committed.
- Use a physical installation distributed through Google Play Internal Testing to validate real Firebase delivery.
- Foreground remote notifications are mirrored through Capacitor Local Notifications so title, body and deep-link data remain visible and actionable while the app is active.

## iOS

- Add the Firebase project's `GoogleService-Info.plist` to the Xcode app target.
- Enable the Push Notifications capability and the `aps-environment` entitlement for the correct Apple team.
- Configure the APNs authentication key in Firebase. Keep the `.p8` file, Key ID, Team ID and credentials outside this repository.
- Enable Background Modes / Remote notifications only if the final delivery behavior requires background processing.

## Real-device validation

Google Play Internal Testing and TestFlight builds must verify:

- permission prompt;
- FCM token registration with the backend;
- foreground and background receipt;
- notification taps and deep links;
- cold start from a notification;
- token refresh/upsert;
- device disabling during logout.

Simulator and generic CI smoke builds do not establish real FCM/APNs delivery.
