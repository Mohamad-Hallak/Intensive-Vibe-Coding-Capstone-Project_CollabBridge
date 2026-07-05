# CollabBridge — Deployment Guide

This guide covers all deployment scenarios from local development to production Docker deployment.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12+ | Backend runtime |
| Node.js | 20+ | Frontend build |
| Docker | 24+ | Containerized deployment |
| Docker Compose | 2.x | Multi-container orchestration |
| Git | Any | Source control |

---

## Environment Configuration

CollabBridge uses environment variables for all configuration. **Never hardcode secrets.**

### 1. Copy templates

```bash
# Root level (for Docker Compose)
cp .env.example .env

# Backend level (for local dev)
cp backend/.env.example backend/.env
```

### 2. Set your Gemini API key

```bash
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_key_here
```

### 3. Generate a strong secret key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output into `SECRET_KEY` in your `.env`.

---

## Option 1 — Docker Compose (Recommended)

Starts all three services (frontend, backend, MCP server) with one command.

```bash
# Build and start
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down

# View logs
docker-compose logs -f backend
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React UI |
| Backend API | http://localhost:8001 | FastAPI REST |
| API Docs | http://localhost:8001/docs | Swagger UI |
| Health Check | http://localhost:8001/health | Liveness probe |
| MCP Server | http://localhost:8002 | MCP tools |
| MCP Tools | http://localhost:8002/mcp/tools | Tool listing |

---

## Option 2 — Local Development

Best for active development with hot-reload on both frontend and backend.

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set GEMINI_API_KEY

# Start backend (hot-reload)
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup

```bash
# New terminal
cd frontend
npm install
npm run dev
```

Frontend will be at http://localhost:5173 with Vite HMR.

### MCP Server Setup (optional)

```bash
# New terminal
cd backend
python mcp_server/server.py
```

MCP server will be at http://localhost:8002.

### Seed Demo Data

Once the backend is running, seed 50 researchers + 30 projects:

```bash
curl -X POST http://localhost:8001/seed
```

Or click **"Seed Demo Data"** in the frontend sidebar.

---

## Option 3 — Production Deployment

### Docker Build Only

```bash
# Backend production image
docker build -t collabbridge-backend:latest ./backend

# Frontend production image
docker build -t collabbridge-frontend:latest ./frontend

# Run backend
docker run -d \
  -p 8001:8000 \
  -e GEMINI_API_KEY=$GEMINI_API_KEY \
  -e SECRET_KEY=$SECRET_KEY \
  -e ALLOWED_ORIGINS=https://your-domain.com \
  collabbridge-backend:latest
```

### Production Checklist

- [ ] Set `ALLOWED_ORIGINS` to your actual domain (not `*`)
- [ ] Generate unique `SECRET_KEY` and `PASSWORD_SALT`
- [ ] Use a persistent database (PostgreSQL recommended for production)
- [ ] Set up HTTPS via reverse proxy (nginx/Caddy)
- [ ] Configure rate limiting (`RATE_LIMIT_PER_MINUTE`)
- [ ] Enable monitoring/logging

### Cloud Run Deployment

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/collabbridge-backend ./backend

# Deploy to Cloud Run
gcloud run deploy collabbridge-backend \
  --image gcr.io/PROJECT_ID/collabbridge-backend \
  --platform managed \
  --port 8000 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY,SECRET_KEY=$SECRET_KEY
```

---

## Health Checks

```bash
# Backend health
curl http://localhost:8001/health

# MCP server health
curl http://localhost:8002/health
```

Expected response:
```json
{"status": "ok", "service": "CollabBridge Backend", "version": "1.0.0"}
```

---

## Troubleshooting

### Database not seeding
```bash
# Manually trigger seed
curl -X POST http://localhost:8001/seed
```

### Gemini API errors
- Verify `GEMINI_API_KEY` is set correctly
- Check quota limits at https://aistudio.google.com
- The system will fall back to heuristic responses if Gemini is unavailable

### Docker port conflicts
```bash
# Check what's using port 8001
netstat -ano | findstr :8001   # Windows
lsof -i :8001                  # macOS/Linux
```

### Frontend not connecting to backend
Verify `vite.config.js` proxy is set to `http://localhost:8001`.

---

## Python Version Note

The production Dockerfile uses `python:3.12-slim`. The local development venv was created with Python 3.14. Both versions are compatible with all pinned dependencies. If you encounter issues, use Python 3.12 locally to exactly match the Docker environment.
