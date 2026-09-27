# Sign in with Apple

ComeMiVesto uses native Sign in with Apple on iOS through `@capawesome/capacitor-apple-sign-in` and converts the Apple ID token into a Firebase credential with the Firebase JS SDK.

## Platform scope

- iOS: supported.
- Android: Apple login is intentionally not exposed.
- Web: Apple login is intentionally not exposed.
- Google Sign-In remains unchanged on Android and iOS.

## Required configuration

1. Apple Developer App ID `com.acasale.comemivesto` must have the **Sign in with Apple** capability enabled as a primary App ID.
2. Firebase Authentication must have the **Apple** provider enabled.
3. `ios/App/App/App.entitlements` must contain `com.apple.developer.applesignin = Default`.
4. The App Store provisioning profile used by TestFlight must include the same entitlement.

The native iOS flow does not use the Firebase web callback URL or a Service ID. Those are only required if a web/Android OAuth flow is introduced later.

## Authentication flow

`AppleSignIn.signIn()`
→ Apple ID token
→ `OAuthProvider('apple.com').credential({ idToken, rawNonce })`
→ `signInWithCredential(...)`
→ Firebase User
→ `resolveSocialAuthentication()`

A cryptographically random raw nonce is generated for every attempt. Its SHA-256 hex digest is sent to Apple, while the original raw nonce is supplied to Firebase when the credential is created.

The client does not trust Apple token claims for backend authorization. The existing backend continues to trust the Firebase ID token.

## First authorization and profile completion

Apple only returns email and full name on the first authorization. When available, `givenName` and `familyName` are copied immediately into the existing pending social profile.

If the backend reports that the social profile is incomplete, the app opens `/register?social=apple` and reuses the same completion flow already used by Google. Name and surname remain optional; gender and Terms acceptance remain required.

## Test checklist

1. New Apple account authorization with name/email sharing.
2. New authorization using Hide My Email.
3. Complete the ComeMiVesto social registration.
4. Logout and login again: the flow must work even when Apple no longer returns name/email.
5. Cancel the Apple authorization sheet: no generic error alert should be shown.
6. Existing account / provider collision: show the existing account message.
7. Verify Google Sign-In again on iOS and Android.
8. Verify the TestFlight workflow accepts the provisioning profile Apple entitlement.
