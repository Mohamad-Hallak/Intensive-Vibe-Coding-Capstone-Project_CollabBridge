"""
mcp_server/tools.py — CollabBridge MCP Tool Definitions
=========================================================
Defines all MCP tool schemas and their handler functions.

Each tool is registered as a dict with:
  - name:        Unique tool identifier (snake_case)
  - description: Human-readable description for LLM tool selection
  - inputSchema: JSON Schema for the tool's parameters
  - handler:     Async Python function implementing the tool

The handlers bridge the MCP layer to the existing CollabBridge agent
functions, managing their own DB sessions so the MCP server is fully
self-contained.

Tools exposed:
  1. search_projects       - Full-text + semantic project search
  2. search_researchers    - Full-text + semantic researcher search
  3. match_researchers     - 4-layer project→researcher matching
  4. generate_proposal     - AI collaboration proposal generation
  5. assess_impact         - Multi-dimensional impact scoring
  6. get_funding           - AI funding opportunity discovery
  7. build_team            - Multidisciplinary team assembly
  8. get_sdg_info          - UN SDG reference data
"""

import json
import sys
import os

# Add the backend directory to the path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, Project, Researcher


# ---------------------------------------------------------------------------
# SDG Reference Data (no DB needed)
# ---------------------------------------------------------------------------
SDG_DATA = {
    1: {"name": "No Poverty", "description": "End poverty in all its forms everywhere"},
    2: {"name": "Zero Hunger", "description": "End hunger, achieve food security and improved nutrition"},
    3: {"name": "Good Health and Well-being", "description": "Ensure healthy lives and promote well-being for all"},
    4: {"name": "Quality Education", "description": "Ensure inclusive and equitable quality education"},
    5: {"name": "Gender Equality", "description": "Achieve gender equality and empower all women and girls"},
    6: {"name": "Clean Water and Sanitation", "description": "Ensure availability of water and sanitation for all"},
    7: {"name": "Affordable and Clean Energy", "description": "Ensure access to affordable, reliable, sustainable energy"},
    8: {"name": "Decent Work and Economic Growth", "description": "Promote sustained, inclusive economic growth"},
    9: {"name": "Industry, Innovation and Infrastructure", "description": "Build resilient infrastructure and foster innovation"},
    10: {"name": "Reduced Inequalities", "description": "Reduce inequality within and among countries"},
    11: {"name": "Sustainable Cities and Communities", "description": "Make cities inclusive, safe, resilient and sustainable"},
    12: {"name": "Responsible Consumption and Production", "description": "Ensure sustainable consumption and production patterns"},
    13: {"name": "Climate Action", "description": "Take urgent action to combat climate change and its impacts"},
    14: {"name": "Life Below Water", "description": "Conserve and sustainably use the oceans and marine resources"},
    15: {"name": "Life on Land", "description": "Protect, restore and promote sustainable use of terrestrial ecosystems"},
    16: {"name": "Peace, Justice and Strong Institutions", "description": "Promote peaceful, inclusive societies for sustainable development"},
    17: {"name": "Partnerships for the Goals", "description": "Strengthen the means of implementation and global partnership"},
}


# ---------------------------------------------------------------------------
# Tool Handlers
# ---------------------------------------------------------------------------

async def handle_search_projects(params: dict) -> dict:
    """Search projects by keyword across title, description, sector, location."""
    query = params.get("query", "").lower()
    limit = min(int(params.get("limit", 5)), 20)
    db = SessionLocal()
    try:
        projects = db.query(Project).filter(Project.lang == "en").all()
        results = []
        for p in projects:
            text = f"{p.title} {p.description} {p.sector} {p.location}".lower()
            if query in text:
                results.append({
                    "id": p.id,
                    "title": p.title,
                    "sector": p.sector,
                    "location": p.location,
                    "organization": p.organization,
                    "description": (p.description or "")[:200] + "...",
                    "sdgs": json.loads(p.sdgs or "[]"),
                    "priority": p.priority,
                })
        return {"projects": results[:limit], "total_found": len(results), "query": query}
    finally:
        db.close()


async def handle_search_researchers(params: dict) -> dict:
    """Search researchers by keyword across name, expertise, skills, institution."""
    query = params.get("query", "").lower()
    limit = min(int(params.get("limit", 5)), 20)
    db = SessionLocal()
    try:
        researchers = db.query(Researcher).filter(Researcher.lang == "en").all()
        results = []
        for r in researchers:
            skills_text = " ".join(json.loads(r.skills or "[]")).lower()
            text = f"{r.name} {r.expertise} {skills_text} {r.institution} {r.country}".lower()
            if query in text:
                results.append({
                    "id": r.id,
                    "name": r.name,
                    "institution": r.institution,
                    "country": r.country,
                    "expertise": r.expertise,
                    "skills": json.loads(r.skills or "[]")[:8],
                    "availability": r.availability,
                    "is_syrian_diaspora": r.is_syrian_diaspora,
                })
        return {"researchers": results[:limit], "total_found": len(results), "query": query}
    finally:
        db.close()


async def handle_match_researchers(params: dict) -> dict:
    """Run the 4-layer matching engine to find best researchers for a project."""
    project_id = int(params.get("project_id", 0))
    limit = min(int(params.get("limit", 5)), 10)
    db = SessionLocal()
    try:
        from app.agents.matcher import match_project_with_researchers
        matches = match_project_with_researchers(project_id, db, limit=limit, explain=True)
        return {
            "project_id": project_id,
            "matches": matches,
            "match_count": len(matches),
            "algorithm": "4-layer: semantic embedding + weighted metadata + rule adjustments + LLM explanation",
        }
    except ValueError as e:
        return {"error": str(e)}
    finally:
        db.close()


async def handle_generate_proposal(params: dict) -> dict:
    """Generate a full collaboration proposal markdown document for a project."""
    project_id = int(params.get("project_id", 0))
    db = SessionLocal()
    try:
        from app.agents.proposal import generate_collaboration_proposal
        proposal_md = generate_collaboration_proposal(project_id, db)
        return {
            "project_id": project_id,
            "proposal": proposal_md,
            "format": "markdown",
        }
    except ValueError as e:
        return {"error": str(e)}
    finally:
        db.close()


async def handle_assess_impact(params: dict) -> dict:
    """Assess the multi-dimensional societal impact of a project."""
    project_id = int(params.get("project_id", 0))
    db = SessionLocal()
    try:
        from app.agents.impact import assess_project_impact
        impact = assess_project_impact(project_id, db)
        return {"project_id": project_id, "impact": impact}
    except ValueError as e:
        return {"error": str(e)}
    finally:
        db.close()


async def handle_get_funding(params: dict) -> dict:
    """Find funding opportunities for a project or researcher."""
    project_id = params.get("project_id")
    researcher_id = params.get("researcher_id")
    db = SessionLocal()
    try:
        from app.agents.funding_agent import find_funding_opportunities
        opportunities = find_funding_opportunities(
            project_id=int(project_id) if project_id else None,
            researcher_id=int(researcher_id) if researcher_id else None,
            db=db,
        )
        return {"opportunities": opportunities, "count": len(opportunities)}
    except ValueError as e:
        return {"error": str(e)}
    finally:
        db.close()


async def handle_build_team(params: dict) -> dict:
    """Build a multidisciplinary research team for a project."""
    project_id = int(params.get("project_id", 0))
    db = SessionLocal()
    try:
        from app.agents.team_builder import build_multidisciplinary_team
        team = build_multidisciplinary_team(project_id, db)
        return team
    except ValueError as e:
        return {"error": str(e)}
    finally:
        db.close()


async def handle_get_sdg_info(params: dict) -> dict:
    """Get information about UN Sustainable Development Goals."""
    sdg_ids = params.get("sdg_ids", [])
    if not sdg_ids:
        return {"sdgs": SDG_DATA, "total": len(SDG_DATA)}
    result = {
        "sdgs": {
            str(sdg_id): SDG_DATA.get(int(sdg_id), {"name": "Unknown", "description": ""})
            for sdg_id in sdg_ids
        }
    }
    return result


# ---------------------------------------------------------------------------
# Tool Registry
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "name": "search_projects",
        "description": (
            "Search CollabBridge projects by keyword. Returns matching Syrian reconstruction "
            "projects with their sector, location, SDG alignment, and priority."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword(s)"},
                "limit": {"type": "integer", "description": "Max results (default: 5, max: 20)", "default": 5},
            },
            "required": ["query"],
        },
        "handler": handle_search_projects,
    },
    {
        "name": "search_researchers",
        "description": (
            "Search CollabBridge researchers by keyword. Returns matching experts with "
            "their institution, country, expertise, and skills."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword(s)"},
                "limit": {"type": "integer", "description": "Max results (default: 5, max: 20)", "default": 5},
            },
            "required": ["query"],
        },
        "handler": handle_search_researchers,
    },
    {
        "name": "match_researchers",
        "description": (
            "Run the CollabBridge 4-layer AI matching engine to find the best researchers "
            "for a given project. Layers: semantic embedding similarity, weighted metadata "
            "matching, rule-based adjustments, and LLM-generated explanation."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "The numeric ID of the project"},
                "limit": {"type": "integer", "description": "Number of top matches to return (default: 5)", "default": 5},
            },
            "required": ["project_id"],
        },
        "handler": handle_match_researchers,
    },
    {
        "name": "generate_proposal",
        "description": (
            "Generate a detailed collaboration proposal markdown document for a project. "
            "Includes executive summary, objectives, recommended team, risk assessment, "
            "SDG alignment, and funding sources."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "The numeric ID of the project"},
            },
            "required": ["project_id"],
        },
        "handler": handle_generate_proposal,
    },
    {
        "name": "assess_impact",
        "description": (
            "Assess the societal impact of a project across 6 dimensions: "
            "Social, Environmental, Economic, Innovation, Feasibility, and Scalability. "
            "Returns numerical scores (0-10) and a narrative summary."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "The numeric ID of the project"},
            },
            "required": ["project_id"],
        },
        "handler": handle_assess_impact,
    },
    {
        "name": "get_funding",
        "description": (
            "Find matching international funding opportunities (IEEE, UN, USAID, Horizon Europe, etc.) "
            "for a project or researcher profile using the AI Funding Agent."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID (use this OR researcher_id)"},
                "researcher_id": {"type": "integer", "description": "Researcher ID (use this OR project_id)"},
            },
        },
        "handler": handle_get_funding,
    },
    {
        "name": "build_team",
        "description": (
            "Build an optimal multidisciplinary research team for a project. "
            "Returns recommended roles and the best-matched researchers for each role."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "The numeric ID of the project"},
            },
            "required": ["project_id"],
        },
        "handler": handle_build_team,
    },
    {
        "name": "get_sdg_info",
        "description": (
            "Get information about UN Sustainable Development Goals (SDGs). "
            "Pass specific SDG IDs (1-17) or omit to get all 17 SDGs."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "sdg_ids": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of SDG numbers (1-17). Omit for all SDGs.",
                },
            },
        },
        "handler": handle_get_sdg_info,
    },
]

# Index by name for fast lookup
TOOL_MAP = {tool["name"]: tool for tool in TOOLS}
