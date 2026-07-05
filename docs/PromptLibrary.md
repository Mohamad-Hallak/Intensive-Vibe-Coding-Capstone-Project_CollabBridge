# CollabBridge — Prompt Library Reference

All AI prompts used by CollabBridge agents, organized by module. This document serves as the engineering reference for the prompt system.

---

## Design Philosophy

### Why a Centralized Prompt Library?

1. **No duplication** — Each prompt exists in exactly one place
2. **Versioned** — Module docstrings track prompt evolution
3. **Testable** — Prompt builder functions have clear inputs/outputs
4. **Multilingual** — All prompts support English and Arabic
5. **Composable** — Prompts are functions, not strings, so context is always fresh

### Prompt Location

All prompts live in `backend/app/prompts/`:

```
backend/app/prompts/
├── __init__.py              # Public API registry
├── researcher_prompts.py    # Agent 2 + 4 (researcher flow)
├── project_prompts.py       # Agent 3 + 4 (project flow)
├── matching_prompts.py      # Agent 5 (match explanations)
├── proposal_prompts.py      # Agent 7 (proposal generation)
├── impact_prompts.py        # Agent 8 (impact assessment)
└── funding_prompts.py       # Agent 11 (funding search)
```

---

## Module Reference

### `researcher_prompts.py`

#### `RESEARCHER_SYSTEM_INSTRUCTION`
System instruction injected into all researcher interview Gemini calls.

**Character:** Warm, encouraging, professional interviewer  
**Key behaviors:** One question at a time, acknowledge answers, adapt to context  
**Special extractions:** Motivation, novelty, technical approach, scalability

---

#### `build_researcher_question_prompt(history, extracted, missing, lang)`

Generates the next conversational interview question.

| Arg | Type | Description |
|-----|------|-------------|
| `history` | `list` | Last N conversation turns `[{role, content}]` |
| `extracted` | `dict` | Already-captured profile fields |
| `missing` | `list` | Field names still needed |
| `lang` | `str` | `'en'` or `'ar'` |

**Returns:** Prompt string expecting `{question: str, options: list|null}` JSON

**Technique:** The prompt includes recent history (capped at 10 turns), the already-extracted data, and missing fields — giving Gemini full context to ask a contextually appropriate next question without repetition.

---

#### `build_researcher_extraction_prompt(history, lang)`

Converts full conversation transcript → structured JSON profile.

**Returns:** Prompt string expecting a JSON object with 20+ researcher fields

**Key design:** The prompt lists every expected field explicitly, so Gemini knows what to look for even if the user mentioned it casually mid-conversation.

---

#### `build_researcher_summary_prompt(extracted, lang)`

Generates a friendly markdown confirmation summary.

**Returns:** Prompt string expecting a markdown summary + confirmation question

**Technique:** Presents all captured data in a user-friendly format and asks for explicit Yes/No approval before saving to database.

---

### `project_prompts.py`

Same structure as `researcher_prompts.py` but for project owner onboarding.

#### Functions
- `PROJECT_OWNER_SYSTEM_INSTRUCTION` — Reconstruction-focused interviewer persona
- `build_project_question_prompt(history, extracted, missing, lang)`
- `build_project_extraction_prompt(history, lang)`
- `build_project_summary_prompt(extracted, lang)`

---

### `matching_prompts.py`

#### `build_match_explanation_prompt(...)`

Generates Layer 4 match explanations.

**Inputs:** Project details, researcher details, numerical scores from Layers 1-3  
**Returns:** Prompt expecting `{overall_match, reasons[], weaknesses[], confidence}`

**Design:** The prompt includes the raw numerical scores from all three matching layers, enabling Gemini to reference specific quantitative evidence in its explanation rather than generating generic match text.

---

### `proposal_prompts.py`

#### `build_proposal_prompt(...)`

Generates full collaboration proposals.

**Inputs:** Project metadata + pre-assembled team member list  
**Returns:** Prompt for a structured 7-section markdown proposal document

**Key instruction:** "Do NOT include placeholders — generate realistic, specific details." This forces Gemini to reason about the actual project context rather than using template language.

---

### `impact_prompts.py`

#### `build_impact_prompt(project_title, sector, description, sdgs)`

**Returns:** Prompt expecting `{scores: {dimension: float}, summary: str}`

**Scoring dimensions:** Social, Environmental, Economic, Innovation, Feasibility, Scalability (0.0–10.0 each)

---

### `funding_prompts.py`

#### `build_funding_prompt(focus_type, focus_title, focus_desc, lang)`

**Returns:** Prompt expecting a JSON array of 3 funding opportunities, each with: `title`, `source`, `amount`, `description`, `deadline`, `url`, `match_reason`

**Key instruction:** "Return ONLY a valid JSON array of objects. No markdown." — Critical for reliable parsing.

---

## Prompt Engineering Techniques Used

| Technique | Where Used | Benefit |
|-----------|------------|---------|
| **Structured output** (`response_mime_type="application/json"`) | All structured agents | Reliable parsing, no markdown wrapping |
| **Response schema** | Question generation | Enforces `{question, options}` structure |
| **System instructions** | Interview agents | Persistent persona without using prompt tokens |
| **History windowing** | Interview agents | Last 10 turns prevent context overflow |
| **Field enumeration** | Extraction agents | Prevents missing fields in sparse conversations |
| **Language injection** | All agents | Single prompt handles EN + AR |
| **No-placeholder instruction** | Proposal agent | Prevents generic template output |
| **Score-grounded explanation** | Matcher agent | Explanations reference actual numbers |

---

## Adding New Prompts

1. Add a builder function to the appropriate module in `backend/app/prompts/`
2. Export it from `backend/app/prompts/__init__.py`
3. Document it in this file
4. Update the agent file to import from `app.prompts` instead of inlining

```python
# Before (inline)
prompt = f"Generate a proposal for {project.title}..."

# After (prompt library)
from app.prompts import build_proposal_prompt
prompt = build_proposal_prompt(project.title, project.sector, ...)
```
