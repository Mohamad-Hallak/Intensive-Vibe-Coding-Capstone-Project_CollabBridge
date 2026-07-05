import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, LargeBinary, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    picture_url = Column(String, nullable=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "picture_url": self.picture_url,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, index=True)
    institution = Column(String)
    country = Column(String, index=True)
    nationality = Column(String, index=True, nullable=True)
    residing_country = Column(String, index=True, nullable=True)
    is_syrian_diaspora = Column(Boolean, default=False)
    department = Column(String)
    position = Column(String)
    expertise = Column(Text)
    interests = Column(Text)  # JSON-serialized list
    skills = Column(Text)     # JSON-serialized list
    languages = Column(Text)  # JSON-serialized list
    availability = Column(String)
    publications = Column(Text) # JSON-serialized list of dicts/strings
    previous_projects = Column(Text) # JSON-serialized list
    preferred_collaborations = Column(Text) # JSON-serialized list
    focus_countries = Column(Text) # JSON-serialized list
    embedding = Column(LargeBinary) # Pickled numpy array or float list
    raw_json = Column(Text)   # JSON string of whole profile
    lang = Column(String, default="en", index=True)
    is_demo = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    receive_funding_notifications = Column(Boolean, default=False)
    notification_channel = Column(String, default="email")
    notification_email = Column(String, nullable=True)
    notification_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "institution": self.institution,
            "country": self.country,
            "nationality": self.nationality,
            "residing_country": self.residing_country,
            "is_syrian_diaspora": self.is_syrian_diaspora,
            "department": self.department,
            "position": self.position,
            "expertise": self.expertise,
            "interests": json.loads(self.interests) if self.interests else [],
            "skills": json.loads(self.skills) if self.skills else [],
            "languages": json.loads(self.languages) if self.languages else [],
            "availability": self.availability,
            "publications": json.loads(self.publications) if self.publications else [],
            "previous_projects": json.loads(self.previous_projects) if self.previous_projects else [],
            "preferred_collaborations": json.loads(self.preferred_collaborations) if self.preferred_collaborations else [],
            "focus_countries": json.loads(self.focus_countries) if self.focus_countries else [],
            "raw_json": json.loads(self.raw_json) if self.raw_json else {},
            "lang": self.lang,
            "is_demo": self.is_demo,
            "is_approved": self.is_approved,
            "receive_funding_notifications": self.receive_funding_notifications,
            "notification_channel": self.notification_channel,
            "notification_email": self.notification_email,
            "notification_phone": self.notification_phone,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    organization = Column(String, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    required_skills = Column(Text)  # JSON-serialized list
    budget = Column(String)
    timeline = Column(String)
    impact = Column(Text)           # JSON-serialized dict/text
    location = Column(String, index=True)
    sector = Column(String, index=True)
    sdgs = Column(Text)             # JSON-serialized list of ints/strings
    priority = Column(String)       # High, Medium, Low
    embedding = Column(LargeBinary)  # Pickled numpy array or float list
    raw_json = Column(Text)         # JSON string of whole profile
    lang = Column(String, default="en", index=True)
    translation_group = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "organization": self.organization,
            "title": self.title,
            "description": self.description,
            "required_skills": json.loads(self.required_skills) if self.required_skills else [],
            "budget": self.budget,
            "timeline": self.timeline,
            "impact": json.loads(self.impact) if self.impact else {},
            "location": self.location,
            "sector": self.sector,
            "sdgs": json.loads(self.sdgs) if self.sdgs else [],
            "priority": self.priority,
            "raw_json": json.loads(self.raw_json) if self.raw_json else {},
            "lang": self.lang,
            "translation_group": self.translation_group,
            "is_demo": self.is_demo,
            "is_approved": self.is_approved,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user_type = Column(String, nullable=True)  # researcher, project_owner
    active_agent = Column(String, default="manager") # manager, project_interview, researcher_interview
    chat_history = Column(Text, default="[]")  # JSON-serialized list of dicts: [{"role": "user"/"assistant", "content": "..."}]
    extracted_profile = Column(Text, default="{}") # JSON-serialized partial profile
    completed = Column(Boolean, default=False)
    lang = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_history(self):
        return json.loads(self.chat_history) if self.chat_history else []

    def set_history(self, history):
        self.chat_history = json.dumps(history)

    def get_profile(self):
        return json.loads(self.extracted_profile) if self.extracted_profile else {}

    def set_profile(self, profile):
        self.extracted_profile = json.dumps(profile)

class FundingNotification(Base):
    __tablename__ = "funding_notifications"

    id = Column(Integer, primary_key=True, index=True)
    researcher_id = Column(Integer, ForeignKey("researchers.id", ondelete="CASCADE"), nullable=False)
    opportunity_title = Column(String)
    opportunity_source = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "researcher_id": self.researcher_id,
            "opportunity_title": self.opportunity_title,
            "opportunity_source": self.opportunity_source,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "is_read": self.is_read
        }

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
