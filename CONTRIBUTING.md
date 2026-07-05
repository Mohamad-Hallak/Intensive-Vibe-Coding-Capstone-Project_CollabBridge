# Contributing to CollabBridge AI

Thank you for your interest in contributing to CollabBridge! This project is a humanitarian AI platform and we welcome contributions that help connect researchers with Syria's reconstruction.

---

## Code of Conduct

Be respectful, inclusive, and kind. This project serves a humanitarian cause — please approach all interactions with empathy and professionalism.

---

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/Mohamad-Hallak/Intensive-Vibe-Coding-Capstone-Project_CollabBridge.git
cd CollabBridge
```

### 2. Set Up Development Environment

Follow [docs/Deployment.md](docs/Deployment.md#option-2--local-development) for the local dev setup.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Your Changes

- Follow the existing code style
- Add comments explaining design decisions
- Update relevant documentation
- Add tests where applicable

### 5. Test Your Changes

```bash
# Backend import validation
cd backend
python -c "from app.main import app; print('✅ Backend OK')"

# Frontend lint
cd frontend
npm run lint
```

### 6. Submit a Pull Request

- Use the PR template
- Reference any related issues
- Describe what changed and why

---

## Development Guidelines

### Backend (Python / FastAPI)

- Follow [PEP 8](https://pep8.org/) style
- Add docstrings to all new functions with design rationale
- Keep agent functions pure where possible (no side effects)
- Use the `app.prompts` module for all new AI prompts — never inline
- Handle Gemini API failures gracefully with fallbacks

### Frontend (React / JSX)

- Use functional components and hooks
- Keep components under 300 lines — split if larger
- Use Lucide icons for consistency
- Follow the existing dark-mode glassmorphism design system
- All API calls go through the `fetch()` calls in `App.jsx` or dedicated service functions

### AI Agents

- Every new agent must have a docstring with: Agent number, role, design notes, fallback strategy
- All prompts must go into `backend/app/prompts/`
- New agents should be registered in `docs/Agents.md`
- New MCP tools should be added to `backend/mcp_server/tools.py`

### Prompt Engineering

- All prompts live in `backend/app/prompts/`
- Document prompts with version history and design rationale
- Test prompts with both English and Arabic input
- Update `docs/PromptLibrary.md` when adding new prompts

---

## Areas Where We Need Help

- 🌍 **More language support** — French, Turkish for broader diaspora reach
- 🧪 **Testing** — Unit tests for agent functions and API endpoints
- 🗄️ **PostgreSQL support** — Migration from SQLite for production
- 📊 **Analytics** — More visualization components
- 🔒 **Security audit** — Review auth flows and input validation
- 📱 **Mobile responsiveness** — Improve mobile layout
- 🌐 **Accessibility** — WCAG 2.1 compliance improvements

---

## Commit Message Convention

```
type(scope): short description

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, agents, mcp, docs

Examples:
feat(agents): add semantic search agent
fix(auth): handle expired token edge case
docs(api): add MCP tool examples
```

---

## Questions?

Open a [GitHub Issue](https://github.com/Mohamad-Hallak/Intensive-Vibe-Coding-Capstone-Project_CollabBridge/issues) with the `question` label.
