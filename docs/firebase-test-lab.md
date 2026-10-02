# Firebase Test Lab for Android

The `Android Firebase Test Lab` workflow builds the development web app, synchronizes the Capacitor Android project, creates a debug APK, and submits that APK to Firebase Test Lab. Robo tests run on Android 11 (API 30) and Android 15 (API 35) virtual devices. The job fails when Test Lab reports a failed or inconclusive matrix.

The workflow runs for pushes and same-repository pull requests targeting `develop`. It can also be started manually. Pull requests from forks are skipped because GitHub does not expose repository secrets to them.

## Required repository configuration

The workflow reuses these repository secrets:

- `ANDROID_GOOGLE_SERVICES_JSON_BASE64`: Base64-encoded Android `google-services.json`, already used by the Android release pipeline.
- `FIREBASE_SERVICE_ACCOUNT_COMEMIVESTO_5E5F9`: Google Cloud service-account JSON, already used by Firebase Hosting workflows.

In Google Cloud project `comemivesto-5e5f9`, enable the Cloud Testing API and Cloud Tool Results API. Grant the service account permission to run Test Lab matrices and write their results. The predefined `Firebase Test Lab Admin` and `Cloud Tool Results Editor` roles provide those permissions; the account may also need `Service Usage Consumer` to consume enabled APIs.

Keep the credentials only in GitHub repository secrets. No APK, Firebase configuration file, or service-account key needs to be generated or committed manually.
