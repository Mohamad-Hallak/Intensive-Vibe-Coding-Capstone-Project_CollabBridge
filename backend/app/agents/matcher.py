import json
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database import Project, Researcher
from app.utils.embeddings import cosine_similarity, get_embedding
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def match_project_with_researchers(project_id: int, db: Session, limit: int = 5, explain: bool = True) -> List[Dict[str, Any]]:
    """
    Agent 5 - Matching Agent:
    Finds the top matching researchers for a project using 4 layers:
    1. Embedding Similarity
    2. Weighted Metadata Matching
    3. Rule-Based Adjustments
    4. LLM Explainability
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with ID {project_id} not found.")

    researchers = db.query(Researcher).filter(Researcher.lang == project.lang).all()
    if not researchers:
        return []

    project_skills = set(x.lower() for x in json.loads(project.required_skills or "[]"))
    project_sdgs = set(int(x) for x in json.loads(project.sdgs or "[]"))
    project_emb = json.loads(project.embedding.decode('utf-8')) if project.embedding else []

    scored_matches = []

    for res in researchers:
        res_skills = set(x.lower() for x in json.loads(res.skills or "[]"))
        res_raw = json.loads(res.raw_json) if res.raw_json else {}
        res_sdgs_list = res_raw.get("sdgs", [])
        res_sdgs = set(int(x) for x in res_sdgs_list if isinstance(x, (int, float)) or (isinstance(x, str) and x.isdigit()))
        res_emb = json.loads(res.embedding.decode('utf-8')) if res.embedding else []

        # --- Layer 1: Semantic Embedding Similarity (30%) ---
        sem_sim = cosine_similarity(project_emb, res_emb) if project_emb and res_emb else 0.5
        layer1_score = sem_sim * 100.0  # Scale to 0-100

        # --- Layer 2: Weighted Metadata Matching (100 points maximum) ---
        # 1. Technical Expertise (30%)
        tech_overlap = len(project_skills.intersection(res_skills))
        tech_score = (tech_overlap / max(len(project_skills), 1)) * 100.0
        
        # 2. Domain Experience (15%)
        res_exp_lower = (res.expertise or "").lower()
        proj_sec_lower = (project.sector or "").lower()
        domain_score = 100.0 if proj_sec_lower in res_exp_lower or any(kw in res_exp_lower for kw in proj_sec_lower.split()) else 50.0

        # 3. Previous Similar Projects (10%)
        res_prev_proj = json.loads(res.previous_projects or "[]")
        prev_proj_score = 100.0 if len(res_prev_proj) > 0 else 0.0

        # 4. Availability (10%)
        res_avail = (res.availability or "").lower()
        avail_score = 100.0
        if "part" in res_avail or "10" in res_avail:
            avail_score = 70.0
        elif "unavail" in res_avail or "0 hrs" in res_avail:
            avail_score = 0.0

        # 5. Budget Compatibility (5%)
        res_funding = (res.raw_json or "").lower()
        budget_score = 100.0
        if "grant" in res_funding or "funded" in res_funding:
            budget_score = 80.0

        # 6. Timeline Compatibility (10%)
        timeline_score = 100.0
        if "short" in (project.timeline or "").lower() and "long" in res_avail:
            timeline_score = 60.0

        # 7. Language Compatibility (5%)
        res_langs = [x.lower() for x in json.loads(res.languages or "[]")]
        # Post-war Syria requires Arabic for optimal community/field integration
        lang_score = 0.0
        if "arabic" in res_langs and "english" in res_langs:
            lang_score = 100.0
        elif "arabic" in res_langs:
            lang_score = 80.0
        elif "english" in res_langs:
            lang_score = 60.0

        # 8. Geographic Preference (5%)
        # Check if researcher is Syrian, in Syria, or has Syria focus / Syrian diaspora
        geo_score = 50.0
        res_country = (res.residing_country or res.country or "").lower()
        res_nationality = (res.nationality or "").lower()
        is_diaspora = getattr(res, 'is_syrian_diaspora', False)
        if "syria" in res_country:
            geo_score = 100.0
        elif is_diaspora or "syrian" in res_nationality or "syria" in res_nationality:
            geo_score = 95.0
        elif any("syria" in str(fc).lower() for fc in json.loads(res.focus_countries or "[]")):
            geo_score = 90.0

        # 9. SDG Alignment (5%)
        sdg_overlap = len(project_sdgs.intersection(res_sdgs))
        sdg_score = (sdg_overlap / max(len(project_sdgs), 1)) * 100.0

        # 10. Collaboration Preference (5%)
        collab_score = 100.0
        if "on-site" in (project.location or "").lower() and "remote" in res_avail:
            collab_score = 50.0

        # Weighted calculation of Layer 2
        layer2_score = (
            tech_score * 0.30 +
            domain_score * 0.15 +
            prev_proj_score * 0.10 +
            avail_score * 0.10 +
            budget_score * 0.05 +
            timeline_score * 0.10 +
            lang_score * 0.05 +
            geo_score * 0.05 +
            sdg_score * 0.05 +
            collab_score * 0.05
        )

        # Merge Layer 1 (Semantic) and Layer 2 (Metadata) - e.g. 50/50 weights or 40/60
        base_match_score = (layer1_score * 0.40) + (layer2_score * 0.60)

        # --- Layer 3: Rule-Based Adjustments ---
        adjustments = 0.0
        # Rule A: If researcher unavailable, subtract points
        if "unavail" in res_avail or "0 hrs" in res_avail:
            adjustments -= 20.0
        # Rule B: If timeline impossible (e.g. needs immediate but researcher unavailable)
        if "immediate" in (project.timeline or "").lower() and ("month" in res_avail or "later" in res_avail):
            adjustments -= 25.0
        # Rule C: If project requires laboratory but researcher has none
        proj_desc = (project.description or "").lower()
        res_labs = json.loads(res.raw_json or "{}").get("laboratory_facilities", [])
        if ("lab" in proj_desc or "testing" in proj_desc or "experiment" in proj_desc) and len(res_labs) == 0:
            adjustments -= 15.0
        # Rule D: If previous similar project exists, add points
        res_prev_text = " ".join(res_prev_proj).lower()
        if any(skill in res_prev_text for skill in project_skills):
            adjustments += 10.0

        final_score = max(0.0, min(100.0, base_match_score + adjustments))

        scored_matches.append({
            "researcher": res,
            "score": round(final_score, 1),
            "layers": {
                "semantic": round(layer1_score, 1),
                "metadata": round(layer2_score, 1),
                "adjustments": adjustments
            }
        })

    # Sort matches by final score descending
    scored_matches.sort(key=lambda x: x["score"], reverse=True)
    top_matches = scored_matches[:limit]

    # --- Layer 4: Explainability ---
    results = []
    for match in top_matches:
        res = match["researcher"]
        if explain:
            explanation = generate_explanation(project, res, match["score"], match["layers"])
        else:
            explanation = {
                "overall_match": f"{match['score']}%",
                "reasons": [],
                "weaknesses": [],
                "confidence": "High" if match["score"] >= 80 else "Medium"
            }
        
        results.append({
            "researcher_id": res.id,
            "researcher_name": res.name,
            "institution": res.institution,
            "country": res.country,
            "expertise": res.expertise,
            "score": match["score"],
            "layers": match["layers"],
            "explanation": explanation
        })

    return results

def generate_explanation(project: Project, researcher: Researcher, score: float, layers: dict) -> dict:
    """
    Agent 5 - Layer 4: Explainability. Generates a breakdown of the match.
    """
    default_expl = {
        "overall_match": f"{score}%",
        "reasons": [
            "Matches required engineering keywords",
            "Aligned with geographic objectives",
            "Understands post-war reconstruction context"
        ],
        "weaknesses": [
            "Limited Arabic speaking capacity for local field work" if "arabic" not in (researcher.languages or "").lower() else "High time-commitment required"
        ],
        "confidence": "High" if score >= 80 else "Medium"
    }

    if not settings.GEMINI_API_KEY:
        return default_expl

    try:
        proj_skills = json.loads(project.required_skills or "[]")
        res_skills = json.loads(researcher.skills or "[]")
        
        prompt = (
            f"Write an explanation of the match between a project and a researcher.\n\n"
            f"Project: {project.title}\n"
            f"Project Sector: {project.sector}\n"
            f"Project Requirements: {', '.join(proj_skills)}\n\n"
            f"Researcher: {researcher.name}\n"
            f"Researcher Expertise: {researcher.expertise}\n"
            f"Researcher Skills: {', '.join(res_skills)}\n"
            f"Researcher Country: {researcher.country}\n\n"
            f"Calculated Match Score: {score}%\n"
            f"Semantic similarity: {layers['semantic']}%\n"
            f"Metadata alignment: {layers['metadata']}%\n"
            f"Rules adjustments: {layers['adjustments']} points\n\n"
            f"Respond with a JSON object matching this schema:\n"
            f"{{\n"
            f"  \"overall_match\": \"92%\",\n"
            f"  \"reasons\": [\"List of 3-4 specific bullet points of why they match, starting with checkmark symbols\"],\n"
            f"  \"weaknesses\": [\"List of 1-2 potential gaps or challenges for this collaboration\"],\n"
            f"  \"confidence\": \"High/Medium/Low\"\n"
            f"}}\n"
            f"Ensure the response is ONLY valid JSON. Keep bullet points concise and professional."
        )
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error generating explanation for match: {e}")
        return default_expl
