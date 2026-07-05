<div align="center">

# 🌉 CollabBridge AI

### *Bridging Researchers with Syria's Reconstruction*

**A Multi-Agent AI Platform for Humanitarian Impact**

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Google ADK](https://img.shields.io/badge/Google%20ADK-2.3.0-34A853?logo=google&logoColor=white)](https://google.github.io/adk-docs/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License: Custom Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)
[![MCP Server](https://img.shields.io/badge/MCP-Server%20Included-blueviolet)](docs/API.md)

**Kaggle AI Agents Capstone · Agents for Good Track**

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [🤖 AI Agents](#-ai-agents) · [📡 MCP Server](#-mcp-server) · [🎥 Demo](#-demo) · [📚 Docs](#-documentation)

</div>

---

## 🌍 The Problem

Syria has experienced one of the most devastating conflicts of the 21st century. Over **13 million Syrians** have been displaced, and the country faces an estimated **$400 billion** in reconstruction needs across infrastructure, water, energy, health, and education sectors.

**The bottleneck isn't funding or willingness — it's connection.**

Thousands of qualified researchers worldwide have relevant expertise. Dozens of NGOs, UN agencies, and local municipalities are running reconstruction projects right now. But they can't find each other efficiently. Traditional academic job boards and conference networking are too slow, too geographically limited, and don't understand the nuanced technical requirements of post-war reconstruction.

**CollabBridge AI solves this with a multi-agent AI system that acts as an intelligent matchmaker, team builder, and collaboration facilitator.**

---

## 💡 Why AI Agents?

Traditional matching systems use keyword search or simple filters. CollabBridge uses a **coordinated system of specialized AI agents** because:

- **Conversational Onboarding** — Real profiles can't be captured by forms. Agents conduct warm, adaptive interviews in English *and* Arabic.
- **Multi-dimensional Matching** — Semantic embeddings + 10 metadata dimensions + rule adjustments + LLM explanations cannot be reduced to a query.
- **Emergent Collaboration** — The Team Builder and Proposal Generator agents work together to create outputs no single agent could produce alone.
- **Graceful Degradation** — Each agent has a heuristic fallback so the system remains functional even without API access.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)               │
│  Dashboard · Chat · Matches · Proposals · Analytics      │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (port 8001)
┌──────────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Agent Orchestrator (Agent 1)        │    │
│  │  Routes conversations → Interview/Task Agents    │    │
│  └──────┬──────────────┬──────────────┬─────────────┘    │
│         │              │              │                  │
│  ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼───────────────┐  │
│  │Researcher   │ │Project     │ │  Specialist Agents  │  │
│  │Interview    │ │Interview   │ │  ├─ Matcher (5)     │  │
│  │Agent (2)    │ │Agent (3)   │ │  ├─ TeamBuilder (6) │  │
│  └──────┬──────┘ └─────┬──────┘ │  ├─ Proposal (7)    │  │
│         │              │        │  ├─ Impact (8)      │  │
│  ┌──────▼──────────────▼──────┐ │  ├─ Recommender (9) │  │
│  │  Extraction Agent (4)      │ │  ├─ Translator (10) │  │
│  │  Structured JSON Profiles  │ │  └─ Funding (11)    │  │
│  └────────────────────────────┘ └─────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │        SQLAlchemy / SQLite Database              │    │
│  │  Users · Researchers · Projects · ChatSessions   │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────┘
                       │ MCP JSON-RPC 2.0 (port 8002)
┌──────────────────────▼──────────────────────────────────┐
│              CollabBridge MCP Server                    │
│  8 Tools: search · match · propose · impact · fund      │
│  Compatible with Claude Desktop, ADK agents, clients    │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agents

| # | Agent | Role | Technology |
|---|-------|------|-----------|
| 1 | **Conversation Manager** | Session routing, interruption handling, role detection | Gemini + heuristics |
| 2 | **Researcher Interview** | Adaptive conversational onboarding for researchers | Gemini structured output |
| 3 | **Project Interview** | Adaptive conversational onboarding for project owners | Gemini structured output |
| 4 | **Information Extraction** | Parses transcripts into structured JSON profiles | Gemini response_schema |
| 5 | **4-Layer Matcher** | Semantic + metadata + rules + LLM explanation matching | Embeddings + Gemini |
| 6 | **Team Builder** | Assembles optimal multidisciplinary research teams | Gemini + keyword scoring |
| 7 | **Proposal Generator** | Creates professional collaboration proposals | Gemini long-form |
| 8 | **Impact Assessment** | Rates projects on 6 humanitarian dimensions | Gemini + heuristics |
| 9 | **Recommendation Agent** | Actionable feedback to improve project execution | Gemini |
| 10 | **Translation Agent** | English ↔ Arabic bilingual support | Gemini |
| 11 | **Funding Agent** | Finds matching grants (UN, IEEE, EU, USAID) | Gemini |

---

## 📡 MCP Server

CollabBridge includes a **standalone MCP (Model Context Protocol) server** that exposes all agents as callable tools for any MCP-compatible client (Claude Desktop, other ADK agents, custom tooling).

```bash
# Start the MCP server
python backend/mcp_server/server.py
# → Running on http://localhost:8002

# Available tools:
#   search_projects      search_researchers
#   match_researchers    generate_proposal
#   assess_impact        get_funding
#   build_team           get_sdg_info
```

See [docs/API.md](docs/API.md) for full MCP client configuration.

---

## 🌐 UN Sustainable Development Goals Addressed

| SDG | Relevance |
|-----|-----------|
| **SDG 4** Quality Education | Matches researchers with education infrastructure projects |
| **SDG 6** Clean Water | Water sanitation reconstruction matching |
| **SDG 7** Affordable Energy | Solar/grid reconstruction projects |
| **SDG 9** Innovation & Infrastructure | Core platform mission |
| **SDG 10** Reduced Inequalities | Syrian diaspora researcher inclusion |
| **SDG 11** Sustainable Cities | Urban reconstruction projects |
| **SDG 16** Peace & Justice | Post-conflict reconstruction support |
| **SDG 17** Partnerships | Cross-border research collaboration |

---

## 🚀 Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
git clone https://github.com/Mohamad-Hallak/Intensive-Vibe-Coding-Capstone-Project_CollabBridge.git
cd CollabBridge

# Copy env template and add your Gemini API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8001/docs |
| MCP Server | http://localhost:8002/mcp/tools |

### Option 2 — Local Development

```bash
# Backend
cd backend
cp .env.example .env          # Add your GEMINI_API_KEY
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# MCP Server (new terminal, optional)
cd backend
python mcp_server/server.py
```

### 🌱 Demo Data

Click **"Seed Demo Data"** in the sidebar to populate the database with:
- **50 expert researchers** from 20+ countries (including Syrian diaspora)
- **30 reconstruction projects** across 8 sectors
- Pre-computed embeddings for instant matching

---

## 📸 Screenshots

> The platform features a dark-mode UI with glassmorphism design, radar charts for impact visualization, and real-time AI chat.

*Dashboard · AI Chat Interview · Match Finder · Impact Radar · Funding Sources*

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture.md](docs/Architecture.md) | System design & Mermaid diagrams |
| [Agents.md](docs/Agents.md) | Complete agent specifications |
| [Deployment.md](docs/Deployment.md) | Docker, local dev, production guides |
| [Security.md](docs/Security.md) | Security design & auth flow |
| [API.md](docs/API.md) | REST API & MCP tool reference |
| [PromptLibrary.md](docs/PromptLibrary.md) | Prompt engineering reference |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [CompetitionChecklist.md](docs/CompetitionChecklist.md) | Kaggle rubric readiness |

---

## 🛠️ Technology Stack

**Backend:** FastAPI · SQLAlchemy · SQLite · Pydantic · Google Gemini SDK · Google ADK 2.3.0  
**Frontend:** Vite · React 18 · Lucide Icons · Recharts  
**AI:** Gemini 2.5 Flash · text-embedding-004 · MCP JSON-RPC 2.0  
**Infrastructure:** Docker · Docker Compose · GitHub Actions CI  
**Security:** PBKDF2-HMAC-SHA256 · JWT (HMAC-HS256) · CORS · Rate Limiting  

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

---

## 📄 License

Custom Non-Commercial License — see [LICENSE](LICENSE) for details. Unauthorized commercial use, reproduction, or distribution is strictly prohibited.

---

<div align="center">

Built with ❤️ for Syria's reconstruction · Kaggle AI Agents Intensive 2026

**GitHub:** [Mohamad-Hallak](https://github.com/Mohamad-Hallak)

</div>
