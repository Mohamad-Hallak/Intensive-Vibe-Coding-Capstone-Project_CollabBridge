# CollabBridge — Security Documentation

This document describes the security architecture, threat model, and implementation decisions for CollabBridge.

---

## Security Principles

1. **No hardcoded secrets** — All secrets are environment-variable driven
2. **Defense in depth** — Multiple layers: auth, CORS, input validation, rate limiting
3. **Principle of least privilege** — Users only access their own data
4. **Graceful failure** — Security failures return generic errors, not stack traces
5. **Audit trail** — Auth events are logged

---

## Secret Management

### What Goes in `.env`

| Variable | Sensitivity | Description |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | 🔴 High | Google AI Studio API key |
| `SECRET_KEY` | 🔴 High | JWT signing secret (min 32 bytes random) |
| `PASSWORD_SALT` | 🟡 Medium | Application-level password salt |
| `DATABASE_URL` | 🟡 Medium | Database connection string |

### Rules
- `.env` files are in `.gitignore` — never committed
- `.env.example` files (committed) contain only placeholder values
- `SECRET_KEY` defaults to a random value if not set (invalidates tokens on restart)
- Rotate `GEMINI_API_KEY` if it was ever committed to version control

### Generating Secrets

```bash
# Generate SECRET_KEY (32 bytes = 64 hex chars)
python -c "import secrets; print(secrets.token_hex(32))"

# Generate PASSWORD_SALT
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

---

## Authentication

### Password Hashing

CollabBridge uses **PBKDF2-HMAC-SHA256** with random per-password salts:

```
stored = hex(random_16_bytes) + "$" + hex(pbkdf2_hmac(password, salt, iterations=260_000))
```

- **260,000 iterations** — OWASP 2023 recommended minimum for PBKDF2-SHA256
- **Per-password random salt** — Prevents rainbow table attacks
- **Backward compatible** — Old SHA-256+static-salt hashes still work for existing accounts

### JWT Tokens

Tokens use **HMAC-SHA256** (HS256):

```
header.payload.signature
```

- Signed with `settings.SECRET_KEY` loaded from environment
- **72-hour expiration** by default
- Constant-time `compare_digest()` for signature verification (prevents timing attacks)
- Expiration checked on every request

### Authentication Flow

```
POST /auth/register → hash password → store user → return token
POST /auth/login    → verify password → return token
Protected routes    → Authorization: Bearer <token> → verify_token()
```

---

## CORS

CORS is configured via the `ALLOWED_ORIGINS` environment variable:

```python
# Development (default)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production
ALLOWED_ORIGINS=https://collabbridge.example.com
```

**Never use `*` in production.** The default `*` in the source code should be replaced before deployment by setting this variable.

---

## Rate Limiting

A simple in-memory token-bucket rate limiter is implemented as FastAPI middleware:

- Default: **60 requests/minute** per IP address
- Configurable via `RATE_LIMIT_PER_MINUTE` env var
- Returns `HTTP 429 Too Many Requests` when exceeded
- Resets automatically after the time window

---

## Input Validation

All API inputs are validated via **Pydantic** schemas:

- Chat messages: length-capped at 2000 characters
- Profile fields: type-validated, sanitized before database writes
- SQL injection: impossible via SQLAlchemy ORM parameterized queries
- No raw SQL string interpolation anywhere

---

## Prompt Injection Prevention

The AI agents are protected against prompt injection:

- User input is never interpolated directly into system instructions
- User text is always clearly delimited in prompts (e.g., `User input: {text}`)
- Gemini's structured output mode (`response_mime_type="application/json"`) limits output to valid JSON, preventing text injection from propagating
- The circuit-breaker (`GEMINI_AVAILABLE`) prevents cascading failures

---

## Database Security

- **SQLAlchemy ORM** — All queries use parameterized statements; no raw string interpolation
- **CASCADE deletes** — Foreign key relationships clean up orphaned records
- **Soft permissions** — `is_approved` flag on researchers/projects for admin review
- **No PII in logs** — User emails and names are not logged at INFO level

---

## API Security

- All sensitive endpoints require a valid JWT token in `Authorization: Bearer`
- Admin endpoints check `is_admin` flag from token payload
- File upload endpoints (if added) must validate MIME type and size

---

## Dependency Security

All Python dependencies are **pinned with exact versions** in `requirements.txt`. This:
- Prevents supply-chain attacks via version drift
- Makes security audits reproducible
- Should be reviewed against `pip-audit` or `safety` before each release

```bash
# Audit dependencies for known CVEs
pip install pip-audit
pip-audit -r requirements.txt
```

---

## Known Limitations (Non-Production)

| Issue | Status | Notes |
|-------|--------|-------|
| SQLite for storage | ⚠️ Dev only | Use PostgreSQL in production |
| In-memory rate limiter | ⚠️ Dev only | Use Redis/Upstash in multi-worker prod |
| No HTTPS in Docker | ⚠️ Dev only | Add nginx/Caddy reverse proxy for prod |
| JWT secret rotation | ⚠️ Manual | Rotating key invalidates all sessions |
