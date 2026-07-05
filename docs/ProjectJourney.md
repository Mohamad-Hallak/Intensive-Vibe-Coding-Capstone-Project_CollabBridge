# CollabBridge — Project Journey

*The story of building CollabBridge AI during the Kaggle AI Agents Intensive Vibe Coding sprint.*

---

## The Spark

The idea for CollabBridge came from a real frustration: watching brilliant Syrian researchers at international universities struggle to connect with the reconstruction projects happening back home. The researchers had the expertise. The projects had the need. But there was no intelligent bridge between them.

Traditional academic job boards don't understand "post-war infrastructure." LinkedIn searches can't filter by "willing to collaborate on Syrian reconstruction." Conferences in the region were impossible to attend safely. The connection bottleneck was real, measurable, and something AI could genuinely solve.

---

## Week 1 — Architecture & Foundation

The first decision was the most important: **reject the form-based approach.**

Every other matching platform makes researchers fill out a structured form with dropdowns and checkboxes. The problem with forms is they optimize for data entry, not for understanding. A professor who has spent 15 years studying water desalination in conflict zones won't capture the nuance of that work in a dropdown menu.

We designed the AI interview instead. An adaptive conversational agent that asks one question at a time, acknowledges what it hears, probes for depth, and builds a rich structured profile from natural conversation. This required:
- Session state management across DB
- Multi-turn conversation history
- Structured extraction from free-form text

The FastAPI + SQLAlchemy foundation was set up in day 2. SQLite for simplicity in development, with SQLAlchemy abstracting the database so PostgreSQL can be swapped in for production without code changes.

---

## Week 2 — The Agent Architecture

The second major decision: **how many agents, and how should they communicate?**

We explored two approaches:
1. **Monolithic** — one large LLM call that does everything
2. **Multi-agent** — specialized agents that each do one thing well

We chose multi-agent for a critical reason: **graceful degradation**. If Gemini is unavailable (API key issues, quota limits, network), a monolithic system fails completely. A multi-agent system with per-agent fallbacks can continue operating at reduced quality — heuristic matching instead of semantic, template proposals instead of AI-generated.

This led to the circuit-breaker pattern: `settings.GEMINI_AVAILABLE` flips to False on the first API failure, preventing cascading retry storms.

By end of week 2, we had 9 working agents: Conversation Manager, two Interview agents, an Extractor, Matcher, Team Builder, Proposal Generator, Impact Assessor, and Recommender.

---

## Week 3 — Bilingual Support & Embeddings

The most technically challenging week: **Arabic language support**.

Arabic is a right-to-left language with complex morphology and a completely different script. Adding Arabic wasn't just a translation layer — it required:
- Database `lang` columns to store both versions
- `translation_group` to link EN/AR counterparts
- Arabic-specific prompts that feel natural (not machine-translated)
- RTL UI rendering in the frontend

The embedding system needed careful design. Text embedding models return different vector spaces for English and Arabic text. Our solution: maintain separate embedding vectors per language, and ensure the matcher only compares embeddings within the same language.

---

## Week 4 — MCP Server & Competition Polish

The final week introduced the **MCP server** — a requirement for the competition but also genuinely valuable for the platform.

The MCP server transforms CollabBridge from a closed application into an open tool platform. Any MCP-compatible client — Claude Desktop, custom ADK agents, research tools — can now:
- Search for projects by topic
- Run the matching engine programmatically
- Generate proposals on demand
- Query funding opportunities

Building the MCP server revealed a useful architectural insight: the clear separation between the agent logic (in `app/agents/`) and the API layer (in `main.py`) made it trivial to expose the same functions through a second interface without code duplication.

The final polish sprint included:
- Security hardening (PBKDF2, env-based secrets)
- Prompt library centralization
- 10-document documentation suite
- GitHub CI/CD setup
- Kaggle submission materials

---

## What We Learned

**On AI agent design:**
- Stateless agents (reading/writing via DB) are easier to debug and scale than stateful in-memory agents
- Structured output (`response_schema`) is worth the setup cost — parsing becomes trivial
- Every agent needs a deterministic fallback, not just error logging

**On prompt engineering:**
- System instructions dramatically improve interview quality vs. putting everything in the user prompt
- Explicitly listing expected output fields prevents Gemini from omitting sparse fields
- "Don't use placeholders" is the most impactful single instruction for proposal generation

**On the humanitarian domain:**
- Arabic isn't just translation — it's respect. Researchers in the Arab world engage differently when addressed in their language.
- The is_syrian_diaspora flag turned out to be unexpectedly important — diaspora researchers are often the most motivated and best-connected to the on-ground situation.
- Impact isn't one number — the 6-dimension radar chart captures trade-offs that a single score hides.

---

## Future Roadmap

1. **Vector database** — Move from in-memory cosine similarity to pgvector for scalable semantic search
2. **Email/SMS notifications** — Implement the notification_channel system for real funding alerts
3. **Video profiles** — Allow researchers to record 2-minute video introductions
4. **Grant writing agent** — Generate full grant application documents, not just proposals
5. **Community features** — Forums, direct messaging, collaboration request workflows
6. **Real-time translation** — Live chat translation for cross-language researcher-project conversations
7. **Mobile app** — React Native port for field workers with limited connectivity
