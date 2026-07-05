# CollabBridge — AI Agents Reference

Complete specification for all 11 AI agents in the CollabBridge system.

---

## Agent Design Principles

1. **Single Responsibility** — Each agent has exactly one primary function.
2. **Circuit Breaker** — Every agent has a heuristic fallback for when Gemini is unavailable.
3. **Stateless Operation** — Agents read/write state via the database, not in-memory, enabling horizontal scaling.
4. **Structured Output** — Agents use `response_mime_type="application/json"` and `response_schema` where possible for reliable parsing.
5. **Multilingual** — Agents support English and Arabic natively.

---

## Agent 1 — Conversation Manager (Orchestrator)

**File:** `backend/app/agents/orchestrator.py`  
**Role:** Session gatekeeper, user-type detector, and conversation router.

### Responsibilities
- Creates or retrieves chat sessions from the database
- Detects whether a new user is a Researcher or Project Owner (via LLM + heuristics)
- Handles out-of-scope "interruption" questions gracefully
- Routes conversations to the appropriate interview agent

### Key Functions
| Function | Description |
|----------|-------------|
| `handle_message()` | Main entry point — routes every incoming chat message |
| `detect_user_type()` | Classifies user as 'researcher', 'project_owner', or 'unknown' |
| `handle_interruptions()` | Detects and answers off-topic questions, then redirects |

### Routing Logic
```
User message
    ↓
[Is session new?] → Create session
    ↓
[Is user type known?] → Check for interruptions
    ↓
Route to ADK interview engine (run_collabbridge_interview)
```

---

## Agent 2 — Researcher Interview Agent

**File:** `backend/app/agents/researcher_agent.py`  
**Role:** Warm, adaptive conversational interviewer for academic researchers.

### Responsibilities
- Conducts a natural conversational interview to capture 20+ researcher profile fields
- Dynamically adapts questions based on what's already been captured
- Generates structured JSON interview summaries
- Saves completed profiles to the database

### Required Fields Collected
`name`, `institution`, `country`, `department`, `position`, `expertise`, `skills`, `languages`, `publications`, `previous_projects`, `availability`, `sdgs`, `motivation`, `novelty_innovation`, `future_vision`

### Conversation Strategy
- Maximum 15 assistant turns before triggering confirmation
- If user says "finish"/"save" — immediately triggers confirmation
- Bilingual: detects Arabic and switches to RTL Arabic prompts

---

## Agent 3 — Project Interview Agent

**File:** `backend/app/agents/project_agent.py`  
**Role:** Warm, adaptive conversational interviewer for project owners.

### Responsibilities
- Conducts a natural conversational interview to capture 25+ project fields
- Extracts technical requirements, SDG alignment, budget, timeline, and risk profile
- Generates structured project summaries
- Saves completed project profiles to the database

### Required Fields Collected
`project_title`, `sector`, `problem`, `budget`, `timeline`, `required_skills`, `preferred_location`, `sdgs`, `collaboration_type`, `technology_readiness_level`, `priority`, `expected_impact`

---

## Agent 4 — Information Extraction Agent

**File:** Embedded in `adk_agents.py` via `extract_researcher_data()` / `extract_project_data()`  
**Role:** Parses raw conversation transcripts into clean structured JSON.

### Approach
Uses Gemini's `response_schema` to enforce structured JSON output, extracting all profile fields from the conversation history regardless of the order they were mentioned.

### Fallback
If Gemini is unavailable, falls back to regex and keyword matching to extract common field patterns.

---

## Agent 5 — 4-Layer Matching Engine

**File:** `backend/app/agents/matcher.py`  
**Role:** Finds the best-matched researchers for any given project.

### Matching Layers

| Layer | Weight | Method | Description |
|-------|--------|--------|-------------|
| **1 — Semantic Similarity** | 40% | Cosine similarity | Compares project and researcher embedding vectors |
| **2 — Weighted Metadata** | 60% | 10-factor scoring | Skills overlap, domain, geography, availability, SDGs, etc. |
| **3 — Rule Adjustments** | ±25pts | Hard rules | Penalizes unavailability, timeline conflicts, missing lab |
| **4 — LLM Explanation** | — | Gemini | Generates human-readable strengths, weaknesses, confidence |

### Metadata Weights
| Factor | Weight |
|--------|--------|
| Technical Skills Overlap | 30% |
| Domain Experience | 15% |
| Previous Similar Projects | 10% |
| Availability | 10% |
| Timeline Compatibility | 10% |
| Language (Arabic priority) | 5% |
| Geographic Preference | 5% |
| SDG Alignment | 5% |
| Budget Compatibility | 5% |
| Collaboration Preference | 5% |

---

## Agent 6 — Team Builder

**File:** `backend/app/agents/team_builder.py`  
**Role:** Designs optimal multidisciplinary research teams for projects.

### Approach
1. Sends project details to Gemini to define ideal role composition (3-4 roles)
2. Falls back to sector-specific hardcoded role templates if Gemini unavailable
3. Scans all researchers and finds the best match for each role using keyword scoring
4. Prevents the same researcher from being allocated to multiple roles

---

## Agent 7 — Proposal Generator

**File:** `backend/app/agents/proposal.py`  
**Role:** Generates professional collaboration proposal markdown documents.

### Output Sections
1. Executive Summary
2. Project Objectives & Deliverables (phased)
3. Recommended Multidisciplinary Team
4. Resource & Budget Allocation
5. Risk Assessment & Mitigation
6. SDG Alignment
7. Funding Sources (UN, diaspora, bilateral)

---

## Agent 8 — Impact Assessment

**File:** `backend/app/agents/impact.py`  
**Role:** Multi-dimensional societal impact scoring (radar chart data).

### Output Dimensions
| Dimension | Description |
|-----------|-------------|
| Social | Direct community benefit and social equity |
| Environmental | Environmental sustainability and emissions |
| Economic | Economic recovery and employment |
| Innovation | Technical novelty and R&D advancement |
| Feasibility | Implementation practicality |
| Scalability | Potential for regional/global replication |

---

## Agent 9 — Recommendation Agent

**File:** `backend/app/agents/recommender.py`  
**Role:** Generates 3-4 actionable, project-specific recommendations.

### Recommendation Categories
- Technical approach improvements
- Local integration strategies
- Partnership and collaboration opportunities
- Risk mitigation tactics
- SDG alignment optimization

---

## Agent 10 — Translation Agent

**File:** `backend/app/agents/translator.py`  
**Role:** Bidirectional English ↔ Arabic translation for all platform content.

### Features
- Translates complete researcher and project profiles
- Maintains both language versions in the database via `lang` column
- `translation_group` links English/Arabic counterparts
- Critical for reaching Arabic-speaking Syrian stakeholders

---

## Agent 11 — Funding Agent

**File:** `backend/app/agents/funding_agent.py`  
**Role:** Identifies matching international funding opportunities.

### Sources Searched
- IEEE Humanitarian Activities Committee (HAC)
- UNDP Syria Recovery Program
- Horizon Europe Post-Conflict Schemes
- USAID Middle East Programs
- UNICEF Innovation Grants
- World Bank Syria Reconstruction Fund
- Syrian diaspora networks and foundations

### Notification System
If a researcher has `receive_funding_notifications = True`, the agent automatically creates `FundingNotification` database records for each discovered opportunity.

---

## MCP Adapter Layer

**Directory:** `backend/mcp_server/`  
**Role:** Exposes all agents as MCP tools for external AI clients.

All 8 MCP tools map directly to the agent functions above, providing a standardized interface for any MCP-compatible client to leverage CollabBridge's full AI capability stack.
