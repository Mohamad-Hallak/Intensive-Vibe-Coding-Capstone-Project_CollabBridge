import json
import logging
from sqlalchemy.orm import Session
from app.database import Project
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def assess_project_impact(project_id: int, db: Session) -> dict:
    """
    Agent 8 - Impact Assessment Agent:
    Estimates the multi-dimensional societal impact of a project, returning 
    numerical radar chart scores and a summary.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with ID {project_id} not found.")

    # Heuristics based on sector for mock output
    sector = (project.sector or "").lower()
    
    # Defaults
    social = 7.0
    environmental = 6.0
    economic = 6.5
    innovation = 7.5
    feasibility = 8.0
    scalability = 8.0
    
    if "water" in sector or "recycle" in sector or "landfill" in sector:
        environmental = 9.5
        social = 8.0
        economic = 7.5
        feasibility = 7.0
    elif "school" in sector or "education" in sector or "telemedicine" in sector or "clinic" in sector or "health" in sector:
        social = 9.8
        environmental = 5.0
        economic = 8.0
        feasibility = 7.5
        scalability = 9.0
    elif "energy" in sector or "solar" in sector or "wind" in sector:
        environmental = 9.0
        economic = 8.5
        social = 7.5
        feasibility = 8.0
    elif "housing" in sector or "modular" in sector or "earthquake" in sector:
        social = 9.2
        environmental = 7.5
        economic = 8.0
        feasibility = 6.5
        scalability = 8.5
    
    summary = (
        f"This project targets crucial requirements in the **{project.sector}** sector. "
        f"By establishing operations in **{project.location}**, it directly benefits localized post-war communities. "
        f"The high social and environmental scores reflect direct community engagement and waste/emission reduction, "
        f"while feasibility and economic viability are supported by modular design principles."
    )

    default_impact = {
        "scores": {
            "Social": social,
            "Environmental": environmental,
            "Economic": economic,
            "Innovation": innovation,
            "Feasibility": feasibility,
            "Scalability": scalability
        },
        "summary": summary
    }

    if not settings.GEMINI_API_KEY:
        return default_impact

    try:
        prompt = (
            f"You are the CollabBridge Impact Assessment Agent (Agent 8).\n"
            f"Estimate the impact of this post-war Syrian reconstruction project:\n"
            f"Title: {project.title}\n"
            f"Sector: {project.sector}\n"
            f"Description: {project.description}\n"
            f"Target SDGs: {project.sdgs}\n\n"
            f"Estimate a score from 0.0 to 10.0 for each of the following dimensions: "
            f"Social, Environmental, Economic, Innovation, Feasibility, Scalability.\n"
            f"Write a 3-4 sentence 'summary' explaining the scores and how the project aligns with UN Sustainable Development Goals.\n\n"
            f"Respond with a JSON object matching this schema:\n"
            f"{{\n"
            f"  \"scores\": {{\n"
            f"    \"Social\": 8.5,\n"
            f"    \"Environmental\": 9.2,\n"
            f"    \"Economic\": 7.0,\n"
            f"    \"Innovation\": 8.0,\n"
            f"    \"Feasibility\": 6.5,\n"
            f"    \"Scalability\": 7.5\n"
            f"  }},\n"
            f"  \"summary\": \"Detailed textual summary explaining impact...\"\n"
            f"}}\n"
            f"Ensure the output is ONLY valid JSON."
        )
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error assessing impact via Gemini: {e}")
        return default_impact
