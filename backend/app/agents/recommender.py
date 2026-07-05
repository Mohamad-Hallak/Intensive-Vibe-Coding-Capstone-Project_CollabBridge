import json
import logging
from sqlalchemy.orm import Session
from app.database import Project
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

def generate_project_recommendations(project_id: int, db: Session) -> list[str]:
    """
    Agent 9 - Recommendation Agent:
    Suggests actionable project improvements, structural adjustments, and expertise pairings.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with ID {project_id} not found.")

    # Heuristics based on sector for mock output
    sector = (project.sector or "").lower()
    
    if "water" in sector or "irrigation" in sector:
        recs = [
            "Integrate low-cost IoT soil moisture sensors to automate irrigation valves and minimize water waste.",
            "Collaborate with agricultural chemists to assess and monitor groundwater salinity levels before scaling.",
            "Consider splitting the project into three phases: 1) local aquifer testing, 2) pilot drip-irrigation deployment, 3) community cooperative training.",
            "Align design specifications with FAO guidelines on water reuse in semi-arid zones."
        ]
    elif "recycle" in sector or "concrete" in sector or "rubble" in sector:
        recs = [
            "Verify compliance with Syrian structural recovery code modifications for recycled aggregate reuse.",
            "Pair this project with material scientists specialized in geopolymer or low-carbon concrete alternatives.",
            "Engage local municipal engineers in Aleppo early to streamline rubble sorting site approvals and logistics.",
            "Incorporate a digital blockchain or database ledger to track structural safety verification history of processed batches."
        ]
    elif "school" in sector or "education" in sector or "tele" in sector or "health" in sector:
        recs = [
            "Implement local offline Edge Servers (e.g. Raspberry Pi caches) to bypass frequent electricity and internet outages in remote villages.",
            "Develop simple, localized SMS or WhatsApp based interfaces to maximize community accessibility and participation.",
            "Establish a training-of-trainers (ToT) model to ensure community self-reliance and project longevity.",
            "Partner with Syrian diaspora medical/academic networks to secure volunteer mentors."
        ]
    else:
        recs = [
            "Structure the implementation in clear, modular milestones to accommodate potential local supply chain disruptions.",
            "Prioritize open-source hardware/software designs to lower long-term maintenance costs for local NGOs.",
            "Seek collaboration with structural or environmental researchers based inside Syrian universities for field coordinate verification.",
            "Optimize local community employment in construction and operational roles to stimulate local economy recovery."
        ]

    if not settings.GEMINI_API_KEY:
        return recs

    try:
        prompt = (
            f"You are the CollabBridge Recommendation Agent (Agent 9).\n"
            f"Analyze the following Syrian reconstruction project details:\n"
            f"Title: {project.title}\n"
            f"Sector: {project.sector}\n"
            f"Description: {project.description}\n"
            f"Required Skills: {project.required_skills}\n"
            f"Timeline: {project.timeline}\n"
            f"TRL: {project.raw_json}\n\n"
            f"Provide exactly 3 to 4 highly specific, actionable recommendations to improve the project's feasibility, local integration, safety, or research partnerships. "
            f"Format the output as a JSON array of strings (e.g., [\"Recommendation 1\", \"Recommendation 2\"]). "
            f"Ensure the output is ONLY valid JSON. Keep recommendations realistic, tailored to the Syrian post-war environment."
        )
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error generating recommendations via Gemini: {e}")
        return recs
