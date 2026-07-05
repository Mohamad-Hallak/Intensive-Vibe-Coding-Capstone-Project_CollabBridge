from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str # user or assistant or system
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    active_agent: str
    completed: bool
    profile: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None

class NextQuestionSchema(BaseModel):
    question: str = Field(..., description="The next conversational question to ask the user")
    options: Optional[List[str]] = Field(default=None, description="A list of 2-6 quick-reply options/buttons for the user, or null if it's an open-ended question")

# Structured schemas for Agent 4 (Information Extraction) and SQLite storage
class ProjectProfileSchema(BaseModel):
    project_title: str = Field(..., description="The name of the project")
    sector: str = Field(..., description="Sector (e.g. Infrastructure, Water, Energy, Agriculture, Healthcare, Education, Economy, Housing, Culture, Transportation, Government)")
    problem: str = Field(..., description="Detailed description of the problem/challenge")
    budget: str = Field(..., description="Estimated budget or funding requirements")
    timeline: str = Field(..., description="Estimated timeline (e.g., '6 months', '1 year')")
    required_skills: List[str] = Field(default_factory=list, description="Key technical skills, fields of study or expertise required")
    preferred_location: str = Field(..., description="Geographic location of the project (e.g., Aleppo, Damascus, Rural Damascus)")
    sdgs: List[int] = Field(default_factory=list, description="UN Sustainable Development Goals (SDGs) targeted, e.g. [6, 7, 11] as integers")
    collaboration_type: str = Field(..., description="Preferred collaboration type (e.g. Remote, On-site, Hybrid, International)")
    technology_readiness_level: str = Field(..., description="TRL levels, from TRL 1 (basic principles) to TRL 9 (proven system)")
    priority: str = Field("Medium", description="Urgency/priority (High, Medium, Low)")
    expected_impact: Dict[str, str] = Field(
        default_factory=dict, 
        description="Expected impacts. Keys: social, environmental, economic."
    )
    # High-fidelity additional fields
    motivation: Optional[str] = Field("", description="The core motivation/drivers behind this project")
    novelty_innovation: Optional[str] = Field("", description="What is novel or innovative about this project's approach")
    current_stage: Optional[str] = Field("", description="Current development stage of the project (concept, prototype, pilot, operational)")
    technical_approach: Optional[str] = Field("", description="Brief summary of the technical or methodological approach")
    required_equipment: List[str] = Field(default_factory=list, description="Specific equipment, lab facilities, or physical assets required")
    funding_status: Optional[str] = Field("", description="Current funding status, secured funds, or sources being pursued")
    milestones: List[str] = Field(default_factory=list, description="Key upcoming milestones or project phases")
    risks_mitigation: Optional[str] = Field("", description="Key risks identified and plan to mitigate them")
    existing_collaborators: List[str] = Field(default_factory=list, description="Existing partner organizations, universities, or key researchers")
    ip_status: Optional[str] = Field("", description="Intellectual property status or licensing strategy (e.g. Open source, patent pending, proprietary)")
    datasets_involved: List[str] = Field(default_factory=list, description="Datasets or data sources involved or needed")
    software_hardware: List[str] = Field(default_factory=list, description="Specific software or hardware systems involved")
    target_beneficiaries: Optional[str] = Field("", description="Who are the primary end users or beneficiaries of the project's output")
    scalability_potential: Optional[str] = Field("", description="Potential for scale or replication in other regions/sectors")
    commercialization_plan: Optional[str] = Field("", description="Potential for commercialization or business model overview")
    future_vision: Optional[str] = Field("", description="Long-term vision or future goals for this project")

class ResearcherProfileSchema(BaseModel):
    name: str = Field(..., description="Researcher's full name")
    institution: str = Field(..., description="Academic institution, research center or company")
    country: str = Field(..., description="Current country of residence")
    nationality: str = Field(..., description="Researcher's nationality or nationalities")
    residing_country: str = Field(..., description="Current country of residence")
    is_syrian_diaspora: bool = Field(False, description="Whether the original nationality is Syrian (diaspora)")
    department: str = Field(..., description="Department or department area")
    position: str = Field(..., description="Job title or academic rank (e.g., Professor, Postdoc, PhD Student, Lead Engineer)")
    expertise: str = Field(..., description="A short summary of overall research expertise")
    keywords: List[str] = Field(default_factory=list, description="Research keyword areas")
    publications: List[str] = Field(default_factory=list, description="List of notable publications or summaries")
    previous_projects: List[str] = Field(default_factory=list, description="Brief names/summaries of previous research or development projects")
    programming_languages: List[str] = Field(default_factory=list, description="Programming languages used")
    software_skills: List[str] = Field(default_factory=list, description="Specialized software packages or tools (e.g. GIS, MATLAB, AutoCAD)")
    laboratory_facilities: List[str] = Field(default_factory=list, description="Available lab machinery, equipment or assets they have access to")
    available_time: str = Field(..., description="Weekly availability or time commitment (e.g. '10 hrs/week', 'Full-time')")
    funding_expectations: str = Field(..., description="Funding, salary or grant expectations (e.g., 'Unfunded', 'Partial funding', 'Grant supported')")
    preferred_project_size: str = Field(..., description="Preferred project scale (Small, Medium, Large)")
    remote_collaboration: bool = Field(True, description="Willing to collaborate remotely")
    international_collaboration: bool = Field(True, description="Willing to collaborate internationally")
    sdgs: List[int] = Field(default_factory=list, description="UN Sustainable Development Goals aligned with their work, e.g. [3, 4, 15]")
    humanitarian_work_interest: bool = Field(True, description="Interested in humanitarian/reconstruction work")
    languages: List[str] = Field(default_factory=list, description="Languages spoken (e.g., English, Arabic, French)")
    # High-fidelity additional fields
    motivation: Optional[str] = Field("", description="Core motivation for engaging in Syrian reconstruction or research collaboration")
    novelty_innovation: Optional[str] = Field("", description="Novel aspects of their research contributions")
    technical_approach: Optional[str] = Field("", description="Key methodologies or scientific approaches used in their research")
    datasets_created: List[str] = Field(default_factory=list, description="Datasets they have created or have access to")
    target_beneficiaries: Optional[str] = Field("", description="Who benefits most from their research findings")
    scalability_potential: Optional[str] = Field("", description="How their research can scale or adapt to real-world deployment")
    future_vision: Optional[str] = Field("", description="Future research trajectory or long-term vision")
    collaboration_opportunities: Optional[str] = Field("", description="Types of collaboration they are seeking (e.g. joint grants, student exchange, consulting)")
