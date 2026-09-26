#!/usr/bin/env python3
"""Configure and validate native Google Sign-In for the iOS App target."""

import argparse
import plistlib
import re
import sys
from pathlib import Path
from typing import Any


EXPECTED_BUNDLE_ID = "com.acasale.comemivesto"
REQUIRED_CUSTOM_SCHEME = "comemivesto"


def fail(message: str) -> None:
    raise ValueError(message)


def read_plist(path: Path, label: str) -> dict[str, Any]:
    try:
        with path.open("rb") as file:
            value = plistlib.load(file)
    except (OSError, plistlib.InvalidFileException) as error:
        fail(f"{label} is missing or invalid: {error}")
    if not isinstance(value, dict):
        fail(f"{label} must contain a plist dictionary")
    return value


def required_string(plist: dict[str, Any], key: str, label: str) -> str:
    value = plist.get(key)
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} is missing required value {key}")
    return value.strip()


def url_schemes(info_plist: dict[str, Any]) -> list[str]:
    schemes: list[str] = []
    url_types = info_plist.get("CFBundleURLTypes", [])
    if not isinstance(url_types, list):
        fail("App Info.plist CFBundleURLTypes must be an array")
    for url_type in url_types:
        if not isinstance(url_type, dict):
            fail("App Info.plist contains an invalid CFBundleURLTypes entry")
        values = url_type.get("CFBundleURLSchemes", [])
        if not isinstance(values, list) or not all(isinstance(value, str) for value in values):
            fail("App Info.plist CFBundleURLSchemes must be an array of strings")
        schemes.extend(values)
    return schemes


def configure(info_plist: dict[str, Any], client_id: str, reversed_client_id: str) -> None:
    info_plist["GIDClientID"] = client_id
    if reversed_client_id in url_schemes(info_plist):
        return

    url_types = info_plist.setdefault("CFBundleURLTypes", [])
    if not isinstance(url_types, list):
        fail("App Info.plist CFBundleURLTypes must be an array")
    url_types.append(
        {
            "CFBundleURLName": "Google Sign-In",
            "CFBundleURLSchemes": [reversed_client_id],
        }
    )


def validate_project_bundle_id(project_path: Path) -> None:
    try:
        project = project_path.read_text(encoding="utf-8")
    except OSError as error:
        fail(f"Xcode project configuration is missing: {error}")

    bundle_ids = re.findall(r"PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);", project)
    if not bundle_ids:
        fail("Xcode project does not define PRODUCT_BUNDLE_IDENTIFIER")
    unexpected = {value.strip().strip('"') for value in bundle_ids} - {EXPECTED_BUNDLE_ID}
    if unexpected:
        fail(f"Xcode project bundle ID must remain {EXPECTED_BUNDLE_ID}")


def validate(
    google_plist: dict[str, Any],
    info_plist: dict[str, Any],
    client_id: str,
    reversed_client_id: str,
    project_path: Path,
) -> None:
    firebase_bundle_id = required_string(google_plist, "BUNDLE_ID", "GoogleService-Info.plist")
    if firebase_bundle_id != EXPECTED_BUNDLE_ID:
        fail(f"GoogleService-Info.plist BUNDLE_ID must be {EXPECTED_BUNDLE_ID}")
    if info_plist.get("GIDClientID") != client_id:
        fail("App Info.plist GIDClientID does not match GoogleService-Info.plist CLIENT_ID")

    schemes = url_schemes(info_plist)
    if reversed_client_id not in schemes:
        fail("App Info.plist is missing the Google REVERSED_CLIENT_ID URL scheme")
    if schemes.count(reversed_client_id) != 1:
        fail("App Info.plist contains the Google REVERSED_CLIENT_ID URL scheme more than once")
    if REQUIRED_CUSTOM_SCHEME not in schemes:
        fail(f"App Info.plist must preserve the {REQUIRED_CUSTOM_SCHEME} URL scheme")

    validate_project_bundle_id(project_path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--google-plist", type=Path, required=True)
    parser.add_argument("--info-plist", type=Path, required=True)
    parser.add_argument("--project", type=Path, required=True)
    args = parser.parse_args()

    try:
        google_plist = read_plist(args.google_plist, "GoogleService-Info.plist")
        info_plist = read_plist(args.info_plist, "App Info.plist")
        client_id = required_string(google_plist, "CLIENT_ID", "GoogleService-Info.plist")
        reversed_client_id = required_string(
            google_plist, "REVERSED_CLIENT_ID", "GoogleService-Info.plist"
        )

        configure(info_plist, client_id, reversed_client_id)
        with args.info_plist.open("wb") as file:
            plistlib.dump(info_plist, file, fmt=plistlib.FMT_XML, sort_keys=False)

        configured_info_plist = read_plist(args.info_plist, "App Info.plist")
        validate(google_plist, configured_info_plist, client_id, reversed_client_id, args.project)
    except (OSError, ValueError) as error:
        print(f"iOS Google Sign-In configuration failed: {error}", file=sys.stderr)
        return 1

    print("iOS Google Sign-In configuration validated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
