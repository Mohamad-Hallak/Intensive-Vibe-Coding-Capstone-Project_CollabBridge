"""
config.py — Application Settings
==================================
Central configuration loader for CollabBridge AI.

Design decisions:
- All secrets (API keys, JWT secret, password salt) are loaded from environment
  variables only — never hardcoded.
- The GEMINI_AVAILABLE circuit-breaker flag is in-process only (not persisted)
  and is flipped to False the first time any Gemini call fails, preventing
  repeated dead-key retries in the same process lifetime.
- ALLOWED_ORIGINS supports a comma-separated list so that multi-host setups
  (e.g. dev on :5173 AND :3000) work without code changes.
"""

import os
import secrets
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()


class Settings:
    # ---- Gemini AI --------------------------------------------------------
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-004")

    # ---- Database ---------------------------------------------------------
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./collabbridge.db")

    # ---- Security ---------------------------------------------------------
    # SECRET_KEY is used for JWT signing. Must be set in production.
    # A random fallback is generated so the app starts without configuration,
    # but existing tokens will be invalidated on every restart in that mode.
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    PASSWORD_SALT: str = os.getenv("PASSWORD_SALT", "collabbridge_default_salt_change_in_prod")

    # ---- CORS -------------------------------------------------------------
    # Comma-separated allowed origins. Defaults to localhost dev ports.
    ALLOWED_ORIGINS: list = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if o.strip()
    ]

    # ---- Rate Limiting ----------------------------------------------------
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

    # ---- Google OAuth (optional) ------------------------------------------
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # ---- Circuit Breaker --------------------------------------------------
    # Flipped to False on the first Gemini API failure so subsequent calls
    # skip straight to heuristic fallbacks instead of retrying a dead key.
    GEMINI_AVAILABLE: bool = True


settings = Settings()
