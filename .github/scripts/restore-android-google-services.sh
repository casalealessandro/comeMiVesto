#!/usr/bin/env bash

set -euo pipefail

readonly output_path="android/app/google-services.json"
readonly expected_package="com.acasale.comemivesto"

if [[ -z "${ANDROID_GOOGLE_SERVICES_JSON_BASE64:-}" ]]; then
  echo "ANDROID_GOOGLE_SERVICES_JSON_BASE64 is required for Android builds." >&2
  exit 1
fi

umask 077
temporary_file="$(mktemp)"
trap 'rm -f "$temporary_file"' EXIT

if ! printf '%s' "$ANDROID_GOOGLE_SERVICES_JSON_BASE64" | base64 --decode > "$temporary_file"; then
  echo "ANDROID_GOOGLE_SERVICES_JSON_BASE64 is not valid Base64." >&2
  exit 1
fi

if [[ ! -s "$temporary_file" ]]; then
  echo "Decoded Android Firebase configuration is empty." >&2
  exit 1
fi

if ! python3 - "$temporary_file" "$expected_package" <<'PY'
import json
import sys

configuration_path, expected_package = sys.argv[1:]

try:
    with open(configuration_path, encoding="utf-8") as configuration_file:
        configuration = json.load(configuration_file)
except (OSError, UnicodeError, json.JSONDecodeError):
    raise SystemExit(1)

packages = {
    client.get("client_info", {}).get("android_client_info", {}).get("package_name")
    for client in configuration.get("client", [])
    if isinstance(client, dict)
}

if expected_package not in packages:
    raise SystemExit(2)
PY
then
  echo "Android Firebase configuration is invalid or does not contain the expected package." >&2
  exit 1
fi

mkdir -p "$(dirname "$output_path")"
mv "$temporary_file" "$output_path"
test -s "$output_path"

echo "Android Firebase configuration restored and validated."
