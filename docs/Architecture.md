# CollabBridge — System Architecture

This document provides a comprehensive technical architecture reference for the CollabBridge AI platform, including system design, agent architecture, data flow, database schema, and deployment topology.

---

## System Overview

CollabBridge is a **three-tier web application** augmented with an AI agent layer and an MCP server:

```
┌─────────────────────────────────────────────────┐
│                   Tier 1: Frontend              │
│               Vite + React (port 5173)          │
└───────────────────────┬─────────────────────────┘
                        │ HTTP REST
┌───────────────────────▼─────────────────────────┐
│             Tier 2: API Backend                 │
│              FastAPI (port 8001)                │
│  ┌─────────────────────────────────────────┐   │
│  │         Multi-Agent AI Layer            │   │
│  │  11 specialized Gemini-powered agents   │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │         Data Access Layer               │   │
│  │  SQLAlchemy ORM + SQLite               │   │
│  └─────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────┘
                        │ MCP JSON-RPC 2.0
┌───────────────────────▼─────────────────────────┐
│           Tier 3: MCP Server (port 8002)        │
│  Exposes all agent capabilities as MCP tools   │
└─────────────────────────────────────────────────┘
```

---

## Agent Architecture

```mermaid
graph TD
    User([👤 User]) -->|HTTP message| API[FastAPI Backend]
    API --> Orch[Agent 1: Conversation Manager]

    Orch -->|researcher| ResInt[Agent 2: Researcher Interview]
    Orch -->|project owner| ProjInt[Agent 3: Project Interview]
    Orch -->|extraction trigger| Extract[Agent 4: Information Extraction]

    ResInt --> Extract
    ProjInt --> Extract

    Extract -->|structured profile| DB[(SQLite DB)]

    DB --> Matcher[Agent 5: 4-Layer Matcher]
    DB --> TeamBuild[Agent 6: Team Builder]
    DB --> Proposal[Agent 7: Proposal Generator]
    DB --> Impact[Agent 8: Impact Assessment]
    DB --> Recom[Agent 9: Recommendation Agent]
    DB --> Trans[Agent 10: Translation Agent]
    DB --> Funding[Agent 11: Funding Agent]

    TeamBuild --> Proposal
    Matcher --> FE[Frontend Dashboard]
    Proposal --> FE
    Impact --> FE
    Recom --> FE
    Funding --> FE

    style Orch fill:#4A90D9,color:#fff
    style Extract fill:#7B68EE,color:#fff
    style Matcher fill:#E8A838,color:#fff
    style DB fill:#555,color:#fff
```

---

## Multi-Agent Communication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant Orch as Orchestrator
    participant ADK as ADK Interview Engine
    participant Extract as Extractor
    participant DB as Database
    participant Gemini as Gemini API

    U->>FE: "I am a researcher"
    FE->>Orch: POST /chat {session_id, message}
    Orch->>Orch: detect_user_type()
    Orch->>ADK: run_collabbridge_interview()
    ADK->>Gemini: ask_next_question() [structured JSON]
    Gemini-->>ADK: {question, options}
    ADK->>DB: UPDATE chat_sessions
    ADK-->>FE: {response, options}

    Note over ADK: After 15 turns or all fields collected...

    ADK->>Gemini: generate_profile_summary()
    Gemini-->>ADK: Markdown summary
    U->>FE: "Yes, looks good!"
    ADK->>Extract: extract_researcher_data(history)
    Extract->>Gemini: Structured extraction
    Gemini-->>Extract: JSON profile
    Extract->>DB: INSERT researchers
    ADK-->>FE: "Profile saved! ✅"
```

---

## 4-Layer Matching Engine

```mermaid
graph LR
    subgraph Layer1[Layer 1: Semantic Similarity 40%]
        E1[Project Embedding] -->|cosine| Sim[Similarity Score]
        E2[Researcher Embedding] --> Sim
    end

    subgraph Layer2[Layer 2: Weighted Metadata 60%]
        M1[Technical Skills 30%]
        M2[Domain Experience 15%]
        M3[Previous Projects 10%]
        M4[Availability 10%]
        M5[Timeline 10%]
        M6[Language 5%]
        M7[Geography 5%]
        M8[SDG Alignment 5%]
        M9[Budget 5%]
        M10[Collaboration 5%]
    end

    subgraph Layer3[Layer 3: Rule Adjustments]
        R1[Unavailability -20]
        R2[Timeline conflict -25]
        R3[Missing lab -15]
        R4[Previous match +10]
    end

    subgraph Layer4[Layer 4: LLM Explanation]
        EX[Gemini generates strengths, weaknesses, confidence]
    end

    Layer1 --> Score[Base Score]
    Layer2 --> Score
    Score --> Layer3
    Layer3 --> Final[Final Score 0-100]
    Final --> Layer4
    Layer4 --> Result[Match Result]
```

---

## Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string password_hash
        string picture_url
        string name
        datetime created_at
    }

    RESEARCHERS {
        int id PK
        int user_id FK
        string name
        string institution
        string country
        string nationality
        string residing_country
        bool is_syrian_diaspora
        string department
        string position
        text expertise
        text interests
        text skills
        text languages
        text publications
        text previous_projects
        blob embedding
        text raw_json
        string lang
        bool is_demo
        bool is_approved
        bool receive_funding_notifications
        string notification_channel
        datetime created_at
    }

    PROJECTS {
        int id PK
        int user_id FK
        string organization
        string title
        text description
        text required_skills
        string budget
        string timeline
        text impact
        string location
        string sector
        text sdgs
        string priority
        blob embedding
        text raw_json
        string lang
        string translation_group
        bool is_demo
        bool is_approved
        datetime created_at
    }

    CHAT_SESSIONS {
        string session_id PK
        int user_id FK
        string user_type
        string active_agent
        text chat_history
        text extracted_profile
        bool completed
        string lang
        datetime created_at
        datetime updated_at
    }

    FUNDING_NOTIFICATIONS {
        int id PK
        int researcher_id FK
        string opportunity_title
        string opportunity_source
        datetime sent_at
        bool is_read
    }

    USERS ||--o{ RESEARCHERS : "owns"
    USERS ||--o{ PROJECTS : "owns"
    USERS ||--o{ CHAT_SESSIONS : "has"
    RESEARCHERS ||--o{ FUNDING_NOTIFICATIONS : "receives"
```

---

## API Flow

```mermaid
graph TD
    Client([Client]) --> Auth{Authenticated?}
    Auth -->|No| Login[POST /auth/login or /auth/register]
    Auth -->|Yes| Routes

    subgraph Routes
        R1[POST /chat]
        R2[GET /projects]
        R3[GET /researchers]
        R4[POST /match/{project_id}]
        R5[POST /team/{project_id}]
        R6[POST /proposal/{project_id}]
        R7[POST /impact/{project_id}]
        R8[POST /funding]
        R9[GET /health]
    end

    Routes --> Agents[AI Agent Layer]
    Agents --> DB[(Database)]
    Agents --> Gemini[Gemini API]
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Docker Compose
        FE_C[Frontend Container<br/>Node 20-slim<br/>port 5173]
        BE_C[Backend Container<br/>Python 3.11-slim<br/>port 8001]
        MCP_C[MCP Server<br/>Python 3.11-slim<br/>port 8002]
    end

    subgraph External Services
        GEMINI[Google Gemini API]
    end

    FE_C -->|REST| BE_C
    MCP_C -->|Imports| BE_C
    BE_C -->|API calls| GEMINI
    BE_C -->|Read/Write| DB[(collabbridge.db)]

    style FE_C fill:#61DAFB,color:#000
    style BE_C fill:#009688,color:#fff
    style MCP_C fill:#7B68EE,color:#fff
    style GEMINI fill:#4285F4,color:#fff
```
