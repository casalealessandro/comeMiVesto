# Firebase Test Lab for Android

The `Android Firebase Test Lab` workflow builds a debug APK from the development Angular configuration and submits it to a synchronous Firebase Test Lab Robo test. The `gcloud` command remains attached to the test until the matrix finishes, so crashes, ANRs, failed matrices, and inconclusive infrastructure results return a non-zero status and fail the GitHub Actions job.

The workflow selects a non-deprecated model whose catalog `form` is `VIRTUAL` and whose `formFactor` is `PHONE` from the live Firebase Test Lab device catalog for every requested API level. It prints the selected model ID, device name, phone form factor, and API level before submission. The complete matrix output is visible in the job log and retained with the tested APK as a workflow artifact. It never requests tablets, wearables, physical devices, or Android Device Streaming.

## Test scopes and cost ceiling

| Trigger | Scope | Android versions | API levels | Maximum device-minutes |
| --- | --- | --- | --- | --- |
| Push or same-repository pull request targeting `develop` | Smoke | Android 14 and Android 16 | 34 and 36 | 10 (2 devices x 5 minutes) |
| Push of a `release-v*` tag | Full | Android 13, 14, 15, and 16 | 33, 34, 35, and 36 | 20 (4 devices x 5 minutes) |
| Manual `workflow_dispatch` | `smoke` or `full` input | Same as the selected scope | Same as the selected scope | 10 or 20 |

Pull requests from forks are skipped because GitHub does not expose the Android Firebase configuration secret to them. A requested API without a currently available, non-deprecated virtual smartphone fails before submission rather than silently substituting a tablet, wearable, physical device, or another Android version.

Before Angular compilation, the workflow runs the repository's existing `tools/generate-build-info.mjs` script with `GIT_COMMIT_SHA` set to the checked-out `HEAD`. Native diagnostics and Crashlytics therefore receive the SHA of the APK submitted to Test Lab rather than the local fallback value.

## GitHub repository configuration

Configure these non-secret repository variables in **Settings > Secrets and variables > Actions > Variables**:

- `FIREBASE_PROJECT_ID`: the Google Cloud project ID that owns the Firebase Test Lab project.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: the complete provider resource name, for example `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`.
- `GCP_DEPLOY_SERVICE_ACCOUNT`: the email address of the Google service account that the workflow is allowed to impersonate.

The existing `ANDROID_GOOGLE_SERVICES_JSON_BASE64` repository secret remains required to create the app's client-side `google-services.json` during the build. It is not a Google Cloud service-account credential and is deleted after the job. This Test Lab workflow does not accept a service-account JSON key or Firebase token.

## Google Cloud Workload Identity Federation

An administrator must complete the following setup once:

1. Enable the **Cloud Testing API**, **Cloud Tool Results API**, **IAM Service Account Credentials API**, and **Security Token Service API** in `FIREBASE_PROJECT_ID`.
2. Create or select a Google service account for this workflow. Grant it `Firebase Test Lab Admin` (`roles/cloudtestservice.testAdmin`), `Cloud Tool Results Editor` (`roles/toolresults.editor`), and `Service Usage Consumer` (`roles/serviceusage.serviceUsageConsumer`) on the Test Lab project.
3. Create a Workload Identity Pool and an OIDC provider whose issuer is `https://token.actions.githubusercontent.com` and whose audience is the provider's default audience. Map at least `google.subject=assertion.sub` and `attribute.repository=assertion.repository`.
4. Restrict the provider with the attribute condition `assertion.repository == 'casalealessandro/comeMiVesto'`.
5. Grant `Workload Identity User` (`roles/iam.workloadIdentityUser`) on the service account to the principal set for repository `casalealessandro/comeMiVesto`, using the pool's `attribute.repository` mapping.
6. Store the provider resource name, service-account email, and project ID in the three repository variables above.

GitHub grants the job only `contents: read` and `id-token: write`. `google-github-actions/auth` exchanges the short-lived GitHub OIDC token through Workload Identity Federation and impersonates the configured service account; no long-lived Google credential is stored in GitHub.
