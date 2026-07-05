# CollabBridge — API Reference

Complete REST API and MCP tool documentation.

---

## REST API

**Base URL:** `http://localhost:8001`  
**Interactive Docs:** http://localhost:8001/docs (Swagger UI)  
**Auth:** Bearer token (from `/auth/login` or `/auth/register`)

---

### Health

#### `GET /health`
Health check endpoint for load balancers and monitoring.

**Response:**
```json
{
  "status": "ok",
  "service": "CollabBridge Backend",
  "version": "1.0.0"
}
```

---

### Authentication

#### `POST /auth/register`
Register a new user account.

**Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": {"id": 1, "email": "researcher@university.edu"}
}
```

#### `POST /auth/login`
Login and receive a JWT token.

**Body:** Same as register.

---

### Chat (Interview Agent)

#### `POST /chat`
Send a message to the conversational interview agent.

**Body:**
```json
{
  "session_id": "abc123",
  "message": "I am a civil engineering researcher"
}
```

**Response:**
```json
{
  "session_id": "abc123",
  "response": "Welcome! Great to have a civil engineer here...",
  "active_agent": "researcher_interview",
  "completed": false,
  "profile": {"name": null, "institution": null},
  "options": ["Full-time", "Part-time", "10 hrs/week"]
}
```

---

### Projects

#### `GET /projects`
List all approved projects.

**Query params:** `lang=en|ar`, `sector=Water`, `limit=50`

#### `POST /projects`
Create a new project (requires auth).

#### `GET /projects/{id}`
Get a single project by ID.

---

### Researchers

#### `GET /researchers`
List all approved researchers.

**Query params:** `lang=en|ar`, `country=Syria`, `limit=50`

#### `GET /researchers/{id}`
Get a single researcher by ID.

---

### Matching (Agent 5)

#### `POST /match/{project_id}`
Run the 4-layer matching engine for a project.

**Query params:** `limit=5`, `explain=true`

**Response:**
```json
[
  {
    "researcher_id": 12,
    "researcher_name": "Dr. Aisha Al-Rahman",
    "score": 94.3,
    "layers": {
      "semantic": 88.0,
      "metadata": 97.5,
      "adjustments": 10.0
    },
    "explanation": {
      "overall_match": "94%",
      "reasons": ["✅ 8/10 required skills match", "✅ Syria-based with field experience"],
      "weaknesses": ["⚠️ Limited availability this quarter"],
      "confidence": "High"
    }
  }
]
```

---

### Team Builder (Agent 6)

#### `POST /team/{project_id}`
Build a multidisciplinary research team.

---

### Proposal Generator (Agent 7)

#### `POST /proposal/{project_id}`
Generate a collaboration proposal document.

**Response:** Markdown string

---

### Impact Assessment (Agent 8)

#### `POST /impact/{project_id}`
Multi-dimensional impact assessment.

**Response:**
```json
{
  "scores": {
    "Social": 9.2,
    "Environmental": 8.5,
    "Economic": 7.8,
    "Innovation": 8.0,
    "Feasibility": 7.5,
    "Scalability": 8.2
  },
  "summary": "This water infrastructure project..."
}
```

---

### Recommendations (Agent 9)

#### `POST /recommendations/{project_id}`
Get actionable project improvement recommendations.

---

### Funding (Agent 11)

#### `POST /funding`
Find matching funding opportunities.

**Body:**
```json
{"project_id": 5}
// or
{"researcher_id": 12}
```

---

### Admin

#### `POST /seed`
Seed the database with demo researchers and projects.

#### `GET /admin/pending-researchers`
List researchers pending approval (admin only).

#### `PUT /admin/approve-researcher/{id}`
Approve a researcher profile.

---

## MCP Server API

**Base URL:** `http://localhost:8002`  
**Protocol:** MCP JSON-RPC 2.0 over HTTP+SSE

---

### Connecting an MCP Client

**SSE endpoint:** `http://localhost:8002/mcp/sse`  
**Message endpoint:** `http://localhost:8002/mcp/msg`

#### Claude Desktop Configuration

Add to `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "collabbridge": {
      "url": "http://localhost:8002/mcp/sse",
      "type": "sse"
    }
  }
}
```

---

### MCP Tool: `search_projects`

Find projects by keyword.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_projects",
    "arguments": {"query": "water sanitation", "limit": 5}
  }
}
```

---

### MCP Tool: `match_researchers`

Run 4-layer matching for a project.

```json
{
  "params": {
    "name": "match_researchers",
    "arguments": {"project_id": 3, "limit": 5}
  }
}
```

---

### MCP Tool: `generate_proposal`

Generate a collaboration proposal.

```json
{
  "params": {
    "name": "generate_proposal",
    "arguments": {"project_id": 3}
  }
}
```

---

### All Available MCP Tools

| Tool | Required Args | Description |
|------|--------------|-------------|
| `search_projects` | `query` | Keyword search over projects |
| `search_researchers` | `query` | Keyword search over researchers |
| `match_researchers` | `project_id` | Run 4-layer matcher |
| `generate_proposal` | `project_id` | Generate proposal doc |
| `assess_impact` | `project_id` | Multi-dim impact scores |
| `get_funding` | `project_id` OR `researcher_id` | Find funding |
| `build_team` | `project_id` | Build research team |
| `get_sdg_info` | `sdg_ids` (optional) | SDG reference data |

---

### Listing Tools

```bash
# HTTP
curl http://localhost:8002/mcp/tools

# JSON-RPC
curl -X POST http://localhost:8002/mcp/msg \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
