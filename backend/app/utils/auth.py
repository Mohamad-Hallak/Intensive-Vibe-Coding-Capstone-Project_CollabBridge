"""
auth.py — Authentication Utilities
=====================================
JWT-like token creation/verification and password hashing for CollabBridge.

Security design:
- Passwords are hashed with PBKDF2-HMAC-SHA256 using a per-password random
  salt (16 bytes). The salt is stored with the hash (hex-encoded, separated
  by '$'). This prevents rainbow-table attacks even if the database leaks.
- The application-level SECRET_KEY used for JWT signing is loaded from
  environment variables via settings — never hardcoded.
- Token expiration is checked on every verify_token call.
- HMAC signatures use compare_digest (constant-time) to prevent timing attacks.
"""

import hmac
import hashlib
import json
import os
import base64
from datetime import datetime, timedelta

from app.config import settings


# ---------------------------------------------------------------------------
# Password Hashing (PBKDF2-HMAC-SHA256 with random per-password salt)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a random 16-byte salt.

    Returns a string in the format:
        <hex_salt>$<hex_hash>

    The salt is stored alongside the hash so verify_password can reconstruct
    the digest without any global constants.
    """
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations=260_000,  # OWASP 2023 recommended minimum
    )
    return salt.hex() + "$" + pwd_hash.hex()


def verify_password(password: str, stored: str) -> bool:
    """
    Verify a plaintext password against a stored PBKDF2 hash.

    Supports both the new PBKDF2 format ('salt$hash') and the legacy
    single-hash format produced by the old sha256 implementation, so
    existing user accounts continue to work after the upgrade.
    """
    if "$" in stored:
        # New PBKDF2 format
        try:
            salt_hex, hash_hex = stored.split("$", 1)
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(hash_hex)
            candidate = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                salt,
                iterations=260_000,
            )
            return hmac.compare_digest(candidate, expected)
        except (ValueError, Exception):
            return False
    else:
        # Legacy format — sha256 with static salt (backward compatibility)
        legacy_salt = "syria_reconstruction_salt_2026"
        candidate = hashlib.sha256((password + legacy_salt).encode("utf-8")).hexdigest()
        return hmac.compare_digest(candidate, stored)


# ---------------------------------------------------------------------------
# JWT-like Token (HMAC-SHA256, HS256)
# ---------------------------------------------------------------------------

def create_token(payload: dict, expires_in_hours: int = 72) -> str:
    """
    Create a signed JWT-like token using HMAC-SHA256.

    The SECRET_KEY is loaded from environment settings — never hardcoded.
    Expiration is embedded in the payload as a Unix timestamp.
    """
    exp = datetime.utcnow() + timedelta(hours=expires_in_hours)
    payload_copy = payload.copy()
    payload_copy["exp"] = exp.timestamp()

    header = {"alg": "HS256", "typ": "JWT"}

    header_b64 = _b64_encode(json.dumps(header, separators=(",", ":")))
    payload_b64 = _b64_encode(json.dumps(payload_copy, separators=(",", ":")))

    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode("utf-8").rstrip("=")

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_token(token: str) -> dict:
    """
    Verify the HMAC-SHA256 signature and expiration of a token.

    Returns the decoded payload dict on success, or None on any failure
    (invalid format, bad signature, expired).
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        # Constant-time signature verification
        signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")

        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        payload_data = json.loads(_b64_decode(payload_b64))

        # Expiration check
        if payload_data.get("exp", 0) < datetime.utcnow().timestamp():
            return None

        return payload_data
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _b64_encode(data: str) -> str:
    return base64.urlsafe_b64encode(data.encode("utf-8")).decode("utf-8").rstrip("=")


def _b64_decode(data: str) -> str:
    rem = len(data) % 4
    padded = data + ("=" * ((4 - rem) % 4))
    return base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
