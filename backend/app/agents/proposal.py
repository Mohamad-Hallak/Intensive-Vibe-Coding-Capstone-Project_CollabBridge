import json
import logging
from sqlalchemy.orm import Session
from app.database import Project
from app.config import settings
from google import genai
from app.agents.team_builder import build_multidisciplinary_team

logger = logging.getLogger(__name__)

def generate_collaboration_proposal(project_id: int, db: Session) -> str:
    """
    Agent 7 - Proposal Generator:
    Generates a high-quality, comprehensive collaboration proposal markdown document.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with ID {project_id} not found.")

    # Get team recommendation first
    team_data = build_multidisciplinary_team(project_id, db)
    
    team_members_str = ""
    for member in team_data.get("team", []):
        team_members_str += f"- **{member['role']}**: {member['researcher_name']} ({member['institution'] or 'N/A'}, {member['country'] or 'N/A'})\n"

    # Default Mock Proposal template
    mock_proposal = f"""# Collaboration Proposal: {project.title}

## 1. Executive Summary
This proposal establishes a joint framework for executing the **{project.title}** project in the sector of **{project.sector}**, located in **{project.location}**. The primary objective is to address the following critical challenge:
> {project.description}

## 2. Project Objectives & Deliverables
- **Phase 1: Research & Assessment (Months 1-3)**
  Analyze site-specific conditions, complete initial feasibility studies, and form the core technical committee.
- **Phase 2: Design & Prototyping (Months 4-8)**
  Develop and test localized prototypes conforming to sustainable and local building standards.
- **Phase 3: Implementation & Scaling (Months 9-12)**
  Deploy the solutions, train local municipalities/NGO personnel, and establish long-term monitoring metrics.

**Key Expected Deliverables:**
1. Initial site characterization and assessment report.
2. Technical blueprint design documents.
3. Operating manual and localized training curriculum.
4. Scale assessment & policy impact briefing.

## 3. Recommended Multidisciplinary Team
To execute this project, we have assembled a multidisciplinary team of top researchers:
{team_members_str}

## 4. Resource & Budget Allocation
- **Estimated Total Budget:** {project.budget or "$100,000"}
- **Timeline:** {project.timeline or "12 Months"}
- **Collaboration Style:** Remote and field coordinates.

## 5. Risk Assessment & Mitigation
1. **Security & Field Access**: Mitigation involves partnering with verified local NGOs and municipalities in Syria to ensure safe transport and onsite access.
2. **Material Shortages & Supply Chain**: Mitigation focuses on sourcing local recycled materials and prioritizing technology configurations that do not require imported parts.

## 6. Sustainable Impact & SDG Alignments
This project aligns directly with the United Nations Sustainable Development Goals (SDGs):
- **SDG 9**: Industry, Innovation, and Infrastructure
- **SDG 11**: Sustainable Cities and Communities
- **SDG 12**: Responsible Consumption and Production

## 7. Potential Funding Sources
- **UN Agencies**: UNDP Syria Recovery Program, UN-Habitat
- **Global Grants**: Horizon Europe Post-Conflict Reconstruction Schemes
- **Diaspora Funds**: Syrian American Medical Society (SAMS) Foundation, Syrian expatriate networks
"""

    if not settings.GEMINI_API_KEY:
        return mock_proposal

    try:
        prompt = (
            f"You are the CollabBridge Proposal Generator (Agent 7).\n"
            f"Generate a professional, detailed, and highly persuasive project proposal markdown document for the following Syrian reconstruction project:\n\n"
            f"Project Title: {project.title}\n"
            f"Sector: {project.sector}\n"
            f"Description/Problem: {project.description}\n"
            f"Location: {project.location}\n"
            f"Estimated Budget: {project.budget}\n"
            f"Timeline: {project.timeline}\n"
            f"Target SDGs: {project.sdgs}\n\n"
            f"Assembled Team:\n{team_members_str}\n\n"
            f"Generate a document with sections: Executive Summary, Objectives, Deliverables, Team Alignment, Risk Assessment, SDGs Alignment, and Specific Funding Sources suited for post-war Syria (like UN agencies, bilateral aid, NGOs, diaspora funds). "
            f"Write in a professional academic tone. Do NOT include placeholders, generate realistic details."
        )
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        return response.text
    except Exception as e:
        logger.error(f"Error generating proposal via Gemini: {e}")
        return mock_proposal
