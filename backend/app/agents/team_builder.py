import json
import logging
from sqlalchemy.orm import Session
from app.database import Project, Researcher
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def build_multidisciplinary_team(project_id: int, db: Session) -> dict:
    """
    Agent 6 - Team Builder Agent:
    Dynamically designs a multidisciplinary team structure needed for the project,
    and searches the database to find the best-matched researchers for each role.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with ID {project_id} not found.")

    researchers = db.query(Researcher).filter(Researcher.lang == project.lang).all()
    if not researchers:
        return {"project_title": project.title, "team": []}

    # Default multidisciplinary roles depending on sector
    sector = (project.sector or "").lower()
    if "water" in sector or "irrigation" in sector:
        roles_definition = [
            {"role_name": "Hydrologist / Water Engineer", "ideal_skills": ["hydrology", "water management", "fluid mechanics"]},
            {"role_name": "Agricultural Scientist", "ideal_skills": ["irrigation", "soil", "crops", "agronomy"]},
            {"role_name": "IoT / Systems Specialist", "ideal_skills": ["iot", "sensors", "wireless", "telemetry", "automation"]},
            {"role_name": "Environmental Economist", "ideal_skills": ["economics", "feasibility", "sustainability", "impact"]}
        ]
    elif "recycle" in sector or "concrete" in sector or "rubble" in sector or "infrastructure" in sector:
        roles_definition = [
            {"role_name": "Material Scientist", "ideal_skills": ["materials", "concrete", "recycling", "composites"]},
            {"role_name": "Structural / Civil Engineer", "ideal_skills": ["civil engineering", "structural assessment", "earthquake"]},
            {"role_name": "Environmental Safety Specialist", "ideal_skills": ["waste", "hazmat", "environmental safety", "pollution"]},
            {"role_name": "Project Coordinator / Economist", "ideal_skills": ["project management", "budget", "operations", "logistics"]}
        ]
    elif "energy" in sector or "solar" in sector or "grid" in sector:
        roles_definition = [
            {"role_name": "Electrical Power Engineer", "ideal_skills": ["power systems", "grid", "microgrids", "electricity"]},
            {"role_name": "Solar / Renewable Expert", "ideal_skills": ["solar", "photovoltaic", "wind", "renewable energy"]},
            {"role_name": "Battery Storage Chemist", "ideal_skills": ["battery", "storage", "lithium", "capacitors", "chemical"]},
            {"role_name": "Socio-economic Planner", "ideal_skills": ["policy", "economics", "rural development", "community"]}
        ]
    else:
        # Generic sector team
        roles_definition = [
            {"role_name": f"Lead {project.sector} Expert", "ideal_skills": list(json.loads(project.required_skills or "[]"))},
            {"role_name": "Data Analyst / Systems Specialist", "ideal_skills": ["data", "software", "gis", "modelling"]},
            {"role_name": "Environmental / Impact Assessor", "ideal_skills": ["impact", "sustainability", "sdg", "ecology"]},
            {"role_name": "Community Coordinator", "ideal_skills": ["community", "field work", "arabic", "humanitarian"]}
        ]

    # If API key is available, let Gemini dynamically define the team roles!
    if settings.GEMINI_API_KEY:
        try:
            prompt = (
                f"Analyze the following Syrian reconstruction project:\n"
                f"Title: {project.title}\n"
                f"Sector: {project.sector}\n"
                f"Description: {project.description}\n"
                f"Required Skills: {project.required_skills}\n\n"
                f"Determine a multidisciplinary team of exactly 3 to 4 distinct specialist roles required to successfully complete this project. "
                f"For each role, provide: 'role_name' and a list of 'ideal_skills'.\n\n"
                f"Respond with a JSON array matching this format:\n"
                f"[\n"
                f"  {{\"role_name\": \"Civil Engineer\", \"ideal_skills\": [\"concrete\", \"structural\", \"rubble\"]}},\n"
                f"  ...\n"
                f"]\n"
                f"Ensure the output is ONLY valid JSON. Keep it relevant to post-war reconstruction."
            )
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            roles_definition = json.loads(response.text)
        except Exception as e:
            logger.error(f"Error dynamically defining team roles via Gemini: {e}")

    # Now, find the single best matched researcher in our database for each role
    team_members = []
    allocated_researchers = set()

    for role in roles_definition:
        role_name = role.get("role_name")
        ideal_skills = [sk.lower() for sk in role.get("ideal_skills", [])]
        
        best_candidate = None
        best_candidate_score = -1.0
        
        for res in researchers:
            # Skip if already allocated to another role in this team
            if res.id in allocated_researchers:
                continue
                
            res_skills = [sk.lower() for sk in json.loads(res.skills or "[]")]
            res_expertise = (res.expertise or "").lower()
            
            # Simple keyword match scoring
            match_score = 0.0
            for skill in ideal_skills:
                if skill in res_skills:
                    match_score += 3.0
                if skill in res_expertise:
                    match_score += 1.5
                    
            if match_score > best_candidate_score:
                best_candidate_score = match_score
                best_candidate = res
        
        if best_candidate:
            allocated_researchers.add(best_candidate.id)
            team_members.append({
                "role": role_name,
                "ideal_skills": role.get("ideal_skills"),
                "researcher_id": best_candidate.id,
                "researcher_name": best_candidate.name,
                "institution": best_candidate.institution,
                "country": best_candidate.country,
                "match_reason": f"Matches key skill requirements for {role_name} with expertise in {best_candidate.expertise[:80]}..."
            })
        else:
            team_members.append({
                "role": role_name,
                "ideal_skills": role.get("ideal_skills"),
                "researcher_id": None,
                "researcher_name": "Position Open",
                "institution": None,
                "country": None,
                "match_reason": "No active researcher fits this highly specific role. Hiring or external recruitment recommended."
            })

    return {
        "project_id": project.id,
        "project_title": project.title,
        "sector": project.sector,
        "team": team_members
    }
