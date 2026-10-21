# Firebase Test Lab for Android

The `Android Firebase Test Lab` workflow builds the web application with the production Angular configuration, packages it in a debug APK isolated from the Google Play release pipeline, and submits it to a synchronous Firebase Test Lab Robo test. The `gcloud` command remains attached to the test until the matrix finishes, so crashes, ANRs, failed matrices, and inconclusive infrastructure results return a non-zero status and fail the GitHub Actions job.

The workflow selects a non-deprecated model whose catalog `form` is `VIRTUAL` and whose `formFactor` is `PHONE` from the live Firebase Test Lab device catalog for every requested API level. It prints the selected model ID, device name, phone form factor, and API level before submission. The complete matrix output is visible in the job log and retained with the tested APK as a workflow artifact. It never requests tablets, wearables, physical devices, or Android Device Streaming.

## Test scopes and cost ceiling

| Trigger | Scope | Android versions | API levels | Maximum device-minutes |
| --- | --- | --- | --- | --- |
| Push or same-repository pull request targeting `main` | Smoke | Android 14 and Android 16 | 34 and 36 | 10 (2 devices x 5 minutes) |
| Push of a `release-v*` tag | Full | Android 13, 14, 15, and 16 | 33, 34, 35, and 36 | 20 (4 devices x 5 minutes) |
| Manual `workflow_dispatch` | `smoke` or `full` input | Same as the selected scope | Same as the selected scope | 10 or 20 |

Pull requests from forks are skipped because GitHub does not expose the Android Firebase configuration secret to them. A requested API without a currently available, non-deprecated virtual smartphone fails before submission rather than silently substituting a tablet, wearable, physical device, or another Android version.

Before Angular compilation, the workflow runs the repository's existing `tools/generate-build-info.mjs` script with `GIT_COMMIT_SHA` set to the checked-out `HEAD`. Native diagnostics and Crashlytics therefore receive the SHA of the APK submitted to Test Lab rather than the local fallback value.

## GitHub repository configuration

Configure these repository secrets in **Settings > Secrets and variables > Actions > Secrets**:

- `FIREBASE_PROJECT_ID`: the Google Cloud project ID that owns Firebase Test Lab.
- `FIREBASE_SERVICE_ACCOUNT_COMEMIVESTO_5E5F9`: the existing Google service-account JSON credential already used by the project.
- `ANDROID_GOOGLE_SERVICES_JSON_BASE64`: the existing Android Firebase client configuration used to restore `android/app/google-services.json` during the build.

The Test Lab workflow reuses the existing service-account credential and does not require Workload Identity Federation, a workload identity provider, or repository-level GCP service-account variables.

The Google service account used by `FIREBASE_SERVICE_ACCOUNT_COMEMIVESTO_5E5F9` must have the permissions required to submit Firebase Test Lab matrices and write Cloud Tool Results in project `FIREBASE_PROJECT_ID`.
