import uuid
import json
from collections import Counter
from fastapi import FastAPI, Depends, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db, init_db, Project, Researcher, ChatSession, User, FundingNotification
from app.schemas import ChatRequest, ChatResponse
from app.agents.orchestrator import handle_message
from app.agents.matcher import match_project_with_researchers
from app.agents.team_builder import build_multidisciplinary_team
from app.agents.proposal import generate_collaboration_proposal
from app.agents.impact import assess_project_impact
from app.agents.recommender import generate_project_recommendations
from app.agents.translator import translate_en_to_ar, translate_entity_dict
from app.utils.synthetic_data import seed_database
from app.utils.auth import hash_password, verify_password, create_token, verify_token
from app.config import settings

# Initialize database structures
import os
import sqlite3

init_db()

# Perform schema migration in-place if user_id or lang columns are missing
db_file = "collabbridge.db"
if os.path.exists(db_file):
    try:
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        
        # Check researchers table
        c.execute("PRAGMA table_info(researchers);")
        res_cols = [row[1] for row in c.fetchall()]
        if "user_id" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;")
            print("Migrated researchers table: Added user_id column.")
        if "lang" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN lang TEXT DEFAULT 'en';")
            print("Migrated researchers table: Added lang column.")
        if "nationality" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN nationality TEXT;")
            print("Migrated researchers table: Added nationality column.")
        if "residing_country" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN residing_country TEXT;")
            print("Migrated researchers table: Added residing_country column.")
        if "is_syrian_diaspora" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN is_syrian_diaspora INTEGER DEFAULT 0;")
            print("Migrated researchers table: Added is_syrian_diaspora column.")
        if "is_demo" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN is_demo INTEGER DEFAULT 0;")
            c.execute("UPDATE researchers SET is_demo = 1 WHERE user_id IS NULL;")
            print("Migrated researchers table: Added is_demo column.")
        if "is_approved" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN is_approved INTEGER DEFAULT 0;")
            c.execute("UPDATE researchers SET is_approved = 1 WHERE user_id IS NULL;")
            print("Migrated researchers table: Added is_approved column.")
        if "receive_funding_notifications" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN receive_funding_notifications INTEGER DEFAULT 0;")
            print("Migrated researchers table: Added receive_funding_notifications column.")
        if "notification_channel" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN notification_channel TEXT DEFAULT 'email';")
            print("Migrated researchers table: Added notification_channel column.")
        if "notification_email" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN notification_email TEXT;")
            print("Migrated researchers table: Added notification_email column.")
        if "notification_phone" not in res_cols:
            c.execute("ALTER TABLE researchers ADD COLUMN notification_phone TEXT;")
            print("Migrated researchers table: Added notification_phone column.")
            
        # Check projects table
        c.execute("PRAGMA table_info(projects);")
        proj_cols = [row[1] for row in c.fetchall()]
        if "user_id" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;")
            print("Migrated projects table: Added user_id column.")
        if "lang" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN lang TEXT DEFAULT 'en';")
            print("Migrated projects table: Added lang column.")
        if "is_demo" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN is_demo INTEGER DEFAULT 0;")
            c.execute("UPDATE projects SET is_demo = 1 WHERE user_id IS NULL;")
            print("Migrated projects table: Added is_demo column.")
        if "is_approved" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN is_approved INTEGER DEFAULT 0;")
            c.execute("UPDATE projects SET is_approved = 1 WHERE user_id IS NULL;")
            print("Migrated projects table: Added is_approved column.")
        if "translation_group" not in proj_cols:
            c.execute("ALTER TABLE projects ADD COLUMN translation_group TEXT;")
            print("Migrated projects table: Added translation_group column.")
            
        # Check chat_sessions table
        c.execute("PRAGMA table_info(chat_sessions);")
        chat_cols = [row[1] for row in c.fetchall()]
        if "user_id" not in chat_cols:
            c.execute("ALTER TABLE chat_sessions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;")
            print("Migrated chat_sessions table: Added user_id column.")
        if "lang" not in chat_cols:
            c.execute("ALTER TABLE chat_sessions ADD COLUMN lang TEXT DEFAULT 'en';")
            print("Migrated chat_sessions table: Added lang column.")
            
        # Check users table
        c.execute("PRAGMA table_info(users);")
        user_cols = [row[1] for row in c.fetchall()]
        if "picture_url" not in user_cols:
            c.execute("ALTER TABLE users ADD COLUMN picture_url TEXT;")
            print("Migrated users table: Added picture_url column.")
        if "name" not in user_cols:
            c.execute("ALTER TABLE users ADD COLUMN name TEXT;")
            print("Migrated users table: Added name column.")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print("Database schema migration error:", e)

# Startup database check: auto-seed if empty
from app.database import SessionLocal
db = SessionLocal()
try:
    researcher_count = db.query(Researcher).count()
    project_count = db.query(Project).count()
    if researcher_count == 0 and project_count == 0:
        print("Database is empty on startup. Automatically seeding default demo data...")
        seed_database(db)
except Exception as e:
    print("Database startup auto-seed check error:", e)
finally:
    db.close()

app = FastAPI(
    title="CollabBridge AI Backend",
    description="Multi-Agent matching platform for Syrian post-war reconstruction challenges.",
    version="1.0.0"
)

# Allow CORS — origins controlled by ALLOWED_ORIGINS env var (see config.py)
# Development default: localhost:5173,localhost:3000
# Production: set ALLOWED_ORIGINS=https://your-domain.com in .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_sync_records():
    """
    On application startup, automatically sync and translate any existing records 
    so that they exist in both English and Arabic.
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Sync researchers
        researchers = db.query(Researcher).filter(Researcher.is_demo == False).all()
        for r in researchers:
            other_lang = "ar" if r.lang == "en" else "en"
            counterpart = db.query(Researcher).filter(
                Researcher.user_id == r.user_id,
                Researcher.lang == other_lang
            ).first()
            
            needs_sync = not counterpart
            if counterpart and other_lang == "ar" and counterpart.name == r.name:
                # If Arabic counterpart has the exact English name, it failed translation earlier
                needs_sync = True
                
            if needs_sync:
                print(f"Startup Sync: Syncing researcher profile {r.name} to {other_lang}")
                sync_researcher_translation(r, db)

        # Sync projects
        projects = db.query(Project).filter(Project.is_demo == False).all()
        for p in projects:
            if not p.translation_group:
                p.translation_group = str(uuid.uuid4())
                db.commit()
                db.refresh(p)
                
            other_lang = "ar" if p.lang == "en" else "en"
            counterpart = db.query(Project).filter(
                Project.translation_group == p.translation_group,
                Project.lang == other_lang
            ).first()
            
            needs_sync = not counterpart
            if counterpart and other_lang == "ar" and counterpart.title == p.title:
                # If Arabic counterpart has the exact English title, it failed translation earlier
                needs_sync = True
                
            if needs_sync:
                print(f"Startup Sync: Syncing project {p.title} to {other_lang}")
                sync_project_translation(p, db)
    except Exception as e:
        print("Startup translation sync error:", e)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to CollabBridge AI Backend APIs"}


@app.get("/health")
def health_check():
    """
    Health check endpoint for Docker healthchecks, load balancers, and monitoring.
    Returns HTTP 200 when the backend is up and accepting requests.
    """
    return {
        "status": "ok",
        "service": "CollabBridge Backend",
        "version": "1.0.0",
    }

# --- AUTHENTICATION DEPENDENCY & ENDPOINTS ---

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/auth/register")
def auth_register(data: Dict[str, str], db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    
    hashed = hash_password(password)
    user = User(email=email, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_token({"user_id": user.id, "email": user.email})
    return {
        "token": token,
        "user": user.to_dict()
    }

@app.post("/api/auth/login")
def auth_login(data: Dict[str, str], db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_token({"user_id": user.id, "email": user.email})
    return {
        "token": token,
        "user": user.to_dict()
    }

@app.post("/api/auth/google")
def auth_google(data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Handles Google OAuth sign-in. Verifies the ID token with Google's tokeninfo API 
    if a CLIENT_ID is configured; otherwise, processes simulated accounts in demo mode.
    """
    credential = data.get("credential")
    is_demo = data.get("is_demo", False)
    
    email = None
    name = None
    picture_url = None
    
    if is_demo or not settings.GOOGLE_CLIENT_ID:
        # In Demo Mode, retrieve mock credentials directly from frontend simulator
        email = data.get("email")
        name = data.get("name")
        picture_url = data.get("picture_url")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required for demo Google Login")
    else:
        # Verify the Google ID Token via Google's tokeninfo endpoint
        if not credential:
            raise HTTPException(status_code=400, detail="Missing Google credential")
            
        import requests
        try:
            res = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}", timeout=5)
            if res.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            token_info = res.json()
            
            # Optionally check client ID audience if configured
            if settings.GOOGLE_CLIENT_ID and token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Google token client ID mismatch")
                
            email = token_info.get("email")
            name = token_info.get("name")
            picture_url = token_info.get("picture")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Google token verification failed: {str(e)}")
            
    if not email:
        raise HTTPException(status_code=401, detail="Failed to retrieve email from Google")
        
    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create a new user with dummy password hash for Google OAuth users
        user = User(email=email, password_hash="google_oauth_user", name=name, picture_url=picture_url)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user's name and picture if they changed or were newly set
        updated = False
        if name and user.name != name:
            user.name = name
            updated = True
        if picture_url and user.picture_url != picture_url:
            user.picture_url = picture_url
            updated = True
        if updated:
            db.commit()
            db.refresh(user)
            
    token = create_token({"user_id": user.id, "email": user.email})
    return {
        "token": token,
        "user": user.to_dict()
    }

@app.get("/api/auth/me")
def auth_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    has_researcher = db.query(Researcher).filter(Researcher.user_id == current_user.id).first() is not None
    # Each project has an "en" and "ar" row (translation counterparts of the same project) —
    # count only the "en" row so a single project isn't reported as two.
    owned_projects_count = db.query(Project).filter(Project.user_id == current_user.id, Project.lang == "en").count()
    
    return {
        "user": current_user.to_dict(),
        "has_researcher": has_researcher,
        "owned_projects_count": owned_projects_count
    }

def sync_researcher_translation(db_res: Researcher, db: Session):
    """
    Automatically creates or updates a translated counterpart of the researcher profile 
    in the other language (English <-> Arabic).
    """
    import importlib
    import app.agents.translator
    importlib.reload(app.agents.translator)
    from app.agents.translator import translate_entity_dict
    from app.utils.embeddings import get_embedding
    
    try:
        current_lang = db_res.lang or "en"
        other_lang = "ar" if current_lang == "en" else "en"
        
        # Check if counterpart exists
        db_res_other = db.query(Researcher).filter(
            Researcher.user_id == db_res.user_id,
            Researcher.lang == other_lang
        ).first()

        is_new_counterpart = db_res_other is None
        if not db_res_other:
            db_res_other = Researcher(user_id=db_res.user_id, lang=other_lang)
            db.add(db_res_other)

        # Translate text fields of db_res to other_lang
        translated_data = translate_entity_dict("researcher", db_res.to_dict(), other_lang)

        # If real (Gemini-backed) translation isn't available, the dictionary fallback can't
        # handle arbitrary user text and would just pass it through untranslated. For a
        # counterpart that already has real translated content, skip overwriting the text
        # fields with that low-fidelity pass-through rather than corrupting it with the
        # wrong-language text; only apply it when creating a brand-new counterpart (better
        # than leaving it blank until a real translation can run).
        skip_text_fields = translated_data.get("_translation_unavailable") and not is_new_counterpart

        if not skip_text_fields:
            db_res_other.name = translated_data.get("name", "")
            db_res_other.institution = translated_data.get("institution", "")
            db_res_other.country = translated_data.get("country", "")
            db_res_other.residing_country = db_res_other.country
            db_res_other.department = translated_data.get("department", "")
            db_res_other.position = translated_data.get("position", "")
            db_res_other.expertise = translated_data.get("expertise", "")
        db_res_other.nationality = db_res.nationality
        db_res_other.is_syrian_diaspora = db_res.is_syrian_diaspora
        db_res_other.availability = db_res.availability
        
        db_res_other.skills = db_res.skills
        db_res_other.interests = db_res.interests
        db_res_other.languages = db_res.languages
        db_res_other.publications = db_res.publications
        db_res_other.previous_projects = db_res.previous_projects
        db_res_other.preferred_collaborations = db_res.preferred_collaborations
        db_res_other.focus_countries = db_res.focus_countries
        
        db_res_other.receive_funding_notifications = db_res.receive_funding_notifications
        db_res_other.notification_channel = db_res.notification_channel
        db_res_other.notification_email = db_res.notification_email
        db_res_other.notification_phone = db_res.notification_phone
        
        # Re-generate search text and embedding for counterpart
        search_text_other = (
            f"Researcher Name: {db_res_other.name}\n"
            f"Affiliation: {db_res_other.institution} ({db_res_other.country})\n"
            f"Position & Dept: {db_res_other.position} in {db_res_other.department}\n"
            f"Expertise Summary: {db_res_other.expertise}\n"
            f"Skills: {db_res_other.skills}"
        )
        emb_vector_other = get_embedding(search_text_other)
        db_res_other.embedding = json.dumps(emb_vector_other).encode('utf-8')
        db_res_other.raw_json = json.dumps(db_res_other.to_dict())
        
        db.commit()
        print(f"Auto-translated researcher profile to {other_lang}")
    except Exception as e:
        logger.error(f"Error syncing researcher translation: {e}")
        db.rollback()

def sync_project_translation(db_proj: Project, db: Session):
    """
    Automatically creates or updates a translated counterpart of the reconstruction project 
    in the other language (English <-> Arabic).
    """
    import importlib
    import app.agents.translator
    importlib.reload(app.agents.translator)
    from app.agents.translator import translate_entity_dict
    from app.utils.embeddings import get_embedding
    
    try:
        current_lang = db_proj.lang or "en"
        other_lang = "ar" if current_lang == "en" else "en"
        
        # If translation_group is not set, generate it
        if not db_proj.translation_group:
            db_proj.translation_group = str(uuid.uuid4())
            db.commit()
            
        # Check if counterpart exists
        db_proj_other = db.query(Project).filter(
            Project.translation_group == db_proj.translation_group,
            Project.lang == other_lang
        ).first()

        is_new_counterpart = db_proj_other is None
        if not db_proj_other:
            db_proj_other = Project(
                user_id=db_proj.user_id,
                translation_group=db_proj.translation_group,
                lang=other_lang
            )
            db.add(db_proj_other)

        # Translate text fields of db_proj to other_lang
        translated_data = translate_entity_dict("project", db_proj.to_dict(), other_lang)

        # If real (Gemini-backed) translation isn't available, the dictionary fallback can't
        # handle arbitrary user text and would just pass it through untranslated. For a
        # counterpart that already has real translated content, skip overwriting the text
        # fields with that low-fidelity pass-through rather than corrupting it with the
        # wrong-language text; only apply it when creating a brand-new counterpart (better
        # than leaving it blank until a real translation can run).
        skip_text_fields = translated_data.get("_translation_unavailable") and not is_new_counterpart

        if not skip_text_fields:
            db_proj_other.title = translated_data.get("title", "")
            db_proj_other.organization = translated_data.get("organization", "")
            db_proj_other.description = translated_data.get("description", "")
            db_proj_other.location = translated_data.get("location", "")
            db_proj_other.sector = translated_data.get("sector", "")
            db_proj_other.priority = translated_data.get("priority", "Medium")

        # Copy direct fields
        db_proj_other.budget = db_proj.budget
        db_proj_other.timeline = db_proj.timeline
        db_proj_other.required_skills = db_proj.required_skills
        db_proj_other.impact = db_proj.impact
        db_proj_other.sdgs = db_proj.sdgs
        
        # Re-generate search text and embedding for counterpart
        search_text_other = (
            f"Project Title: {db_proj_other.title}\n"
            f"Sector: {db_proj_other.sector}\n"
            f"Description: {db_proj_other.description}\n"
            f"Required Skills: {db_proj_other.required_skills}\n"
            f"Location: {db_proj_other.location}"
        )
        emb_vector_other = get_embedding(search_text_other)
        db_proj_other.embedding = json.dumps(emb_vector_other).encode('utf-8')
        db_proj_other.raw_json = json.dumps(db_proj_other.to_dict())
        
        db.commit()
        print(f"Auto-translated project to {other_lang}")
    except Exception as e:
        logger.error(f"Error syncing project translation: {e}")
        db.rollback()

# --- FLEXIBLE PROFILE MANAGEMENT ENDPOINTS ---

@app.get("/api/profile/researcher")
def get_researcher_profile(
    lang: str = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # A researcher has one row per language (en/ar) representing the SAME profile —
    # fetch the row matching the requested language, falling back to any row for
    # this user if that specific language variant hasn't been created yet.
    db_res = db.query(Researcher).filter(Researcher.user_id == current_user.id, Researcher.lang == lang).first()
    if not db_res:
        db_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Researcher profile not found")
    return db_res.to_dict()

@app.put("/api/profile/researcher")
def update_researcher_profile(
    data: Dict[str, Any],
    lang: str = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.utils.embeddings import get_embedding

    # Target the row matching the edited language specifically — querying by
    # user_id alone (ignoring lang) risks editing the wrong-language row and
    # having sync_researcher_translation spawn a duplicate third row.
    db_res = db.query(Researcher).filter(Researcher.user_id == current_user.id, Researcher.lang == lang).first()
    if not db_res:
        db_res = Researcher(user_id=current_user.id, lang=lang)
        db.add(db_res)

    # Update fields
    db_res.name = data.get("name", db_res.name or "")
    db_res.institution = data.get("institution", db_res.institution or "")
    db_res.residing_country = data.get("residing_country", data.get("country", db_res.residing_country or ""))
    db_res.country = db_res.residing_country
    db_res.nationality = data.get("nationality", db_res.nationality or "")
    
    diaspora_val = data.get("is_syrian_diaspora", db_res.is_syrian_diaspora)
    if isinstance(diaspora_val, str):
        db_res.is_syrian_diaspora = diaspora_val.lower() == "true"
    else:
        db_res.is_syrian_diaspora = bool(diaspora_val)
        
    db_res.department = data.get("department", db_res.department or "Research Dept")
    db_res.position = data.get("position", db_res.position or "Researcher")
    db_res.expertise = data.get("expertise", db_res.expertise or "")
    db_res.availability = data.get("availability", db_res.availability or "")
    
    if "receive_funding_notifications" in data:
        db_res.receive_funding_notifications = bool(data["receive_funding_notifications"])
    db_res.notification_channel = data.get("notification_channel", db_res.notification_channel or "email")
    db_res.notification_email = data.get("notification_email", db_res.notification_email)
    db_res.notification_phone = data.get("notification_phone", db_res.notification_phone)
    
    if "interests" in data:
        db_res.interests = json.dumps(data["interests"])
    if "skills" in data:
        db_res.skills = json.dumps(data["skills"])
    if "languages" in data:
        db_res.languages = json.dumps(data["languages"])
    if "publications" in data:
        db_res.publications = json.dumps(data["publications"])
    if "previous_projects" in data:
        db_res.previous_projects = json.dumps(data["previous_projects"])
        
    db_res.preferred_collaborations = json.dumps([data.get("preferred_collaborations", "Medium")])
    db_res.focus_countries = json.dumps([db_res.country])
    
    # Re-generate search text and embedding
    search_text = (
        f"Researcher Name: {db_res.name}\n"
        f"Affiliation: {db_res.institution} ({db_res.country})\n"
        f"Nationality: {db_res.nationality}\n"
        f"Residing Country: {db_res.residing_country}\n"
        f"Syrian Diaspora: {'Yes' if db_res.is_syrian_diaspora else 'No'}\n"
        f"Position & Dept: {db_res.position} in {db_res.department}\n"
        f"Expertise Summary: {db_res.expertise}\n"
        f"Keywords: {db_res.interests}\n"
        f"Skills: {db_res.skills}"
    )
    emb_vector = get_embedding(search_text)
    db_res.embedding = json.dumps(emb_vector).encode('utf-8')
    db_res.raw_json = json.dumps(db_res.to_dict())
    
    # Sync name and picture_url updates back to User model
    user_updated = False
    if "name" in data and current_user.name != data["name"]:
        current_user.name = data["name"]
        user_updated = True
    if "picture_url" in data and current_user.picture_url != data["picture_url"]:
        current_user.picture_url = data["picture_url"]
        user_updated = True
    if user_updated:
        db.add(current_user)

    db.commit()
    db.refresh(db_res)
    sync_researcher_translation(db_res, db)
    return {"message": "Researcher profile updated successfully", "profile": db_res.to_dict()}

@app.get("/api/profile/projects")
def get_user_projects(
    lang: str = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Each project has an "en" and "ar" row (translation counterparts of the same
    # project) — scope to one language so a project isn't listed twice.
    db_projects = db.query(Project).filter(Project.user_id == current_user.id, Project.lang == lang).all()
    return [p.to_dict() for p in db_projects]

@app.post("/api/profile/projects")
def create_user_project(
    data: Dict[str, Any],
    lang: str = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.utils.embeddings import get_embedding
    
    title = data.get("title")
    sector = data.get("sector")
    description = data.get("description")
    location = data.get("location")
    
    if not title or not sector or not description or not location:
        raise HTTPException(status_code=400, detail="Missing required project details")
        
    # Re-generate embedding
    search_text = (
        f"Project Title: {title}\n"
        f"Sector: {sector}\n"
        f"Description: {description}\n"
        f"Required Skills: {json.dumps(data.get('required_skills', []))}\n"
        f"Location: {location}"
    )
    emb_vector = get_embedding(search_text)
    emb_binary = json.dumps(emb_vector).encode('utf-8')
    
    group_uuid = str(uuid.uuid4())
    db_proj = Project(
        user_id=current_user.id,
        title=title,
        organization=data.get("organization", "Anonymous Owner"),
        description=description,
        sector=sector,
        location=location,
        budget=data.get("budget", ""),
        timeline=data.get("timeline", ""),
        priority=data.get("priority", "Medium"),
        required_skills=json.dumps(data.get("required_skills", [])),
        impact=json.dumps(data.get("impact", {})),
        sdgs=json.dumps(data.get("sdgs", [])),
        embedding=emb_binary,
        lang=lang,
        translation_group=group_uuid
    )
    db_proj.raw_json = json.dumps(db_proj.to_dict())
    
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    sync_project_translation(db_proj, db)
    return {"message": "Reconstruction project added successfully", "project": db_proj.to_dict()}

@app.put("/api/profile/projects/{project_id}")
def update_user_project(
    project_id: int,
    data: Dict[str, Any],
    lang: str = Query("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.utils.embeddings import get_embedding
    
    db_proj = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        
    # Update fields
    db_proj.lang = lang
    db_proj.title = data.get("title", db_proj.title)
    db_proj.organization = data.get("organization", db_proj.organization)
    db_proj.description = data.get("description", db_proj.description)
    db_proj.budget = data.get("budget", db_proj.budget)
    db_proj.timeline = data.get("timeline", db_proj.timeline)
    db_proj.location = data.get("location", db_proj.location)
    db_proj.sector = data.get("sector", db_proj.sector)
    db_proj.priority = data.get("priority", db_proj.priority)
    
    if "required_skills" in data:
        db_proj.required_skills = json.dumps(data["required_skills"])
    if "impact" in data:
        db_proj.impact = json.dumps(data["impact"])
    if "sdgs" in data:
        db_proj.sdgs = json.dumps(data["sdgs"])
        
    # Re-generate search text and embedding
    search_text = (
        f"Project Title: {db_proj.title}\n"
        f"Sector: {db_proj.sector}\n"
        f"Description: {db_proj.description}\n"
        f"Required Skills: {db_proj.required_skills}\n"
        f"Location: {db_proj.location}"
    )
    emb_vector = get_embedding(search_text)
    db_proj.embedding = json.dumps(emb_vector).encode('utf-8')
    db_proj.raw_json = json.dumps(db_proj.to_dict())
    
    db.commit()
    db.refresh(db_proj)
    sync_project_translation(db_proj, db)
    return {"message": "Project updated successfully", "project": db_proj.to_dict()}

@app.delete("/api/profile")
def delete_user_account(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db.query(Researcher).filter(Researcher.user_id == current_user.id).delete()
    db.query(Project).filter(Project.user_id == current_user.id).delete()
    db.query(ChatSession).filter(ChatSession.user_id == current_user.id).delete()
    db.query(User).filter(User.id == current_user.id).delete()
    db.commit()
    return {"message": "Account and all profiles deleted successfully"}

@app.post("/api/chat/link")
def link_chat_profile_to_user(
    data: Dict[str, str], 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
        
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session or not session.completed:
        raise HTTPException(status_code=404, detail="Completed chat session not found")
        
    profile_data = session.get_profile()
    from app.utils.embeddings import get_embedding
    
    if session.user_type == "researcher":
        db.query(Researcher).filter(Researcher.user_id == current_user.id).delete()
        
        search_text = (
            f"Researcher Name: {profile_data.get('name')}\n"
            f"Affiliation: {profile_data.get('institution')} ({profile_data.get('country')})\n"
            f"Position & Dept: {profile_data.get('position')} in {profile_data.get('department')}\n"
            f"Expertise Summary: {profile_data.get('expertise')}\n"
            f"Keywords: {', '.join(profile_data.get('keywords', []))}\n"
            f"Skills: {', '.join(profile_data.get('skills', []))}"
        )
        emb_vector = get_embedding(search_text)
        emb_binary = json.dumps(emb_vector).encode('utf-8')
        
        db_res = Researcher(
            user_id=current_user.id,
            name=profile_data.get("name"),
            institution=profile_data.get("institution"),
            country=profile_data.get("country"),
            department=profile_data.get("department", "Research Dept"),
            position=profile_data.get("position", "Researcher"),
            expertise=profile_data.get("expertise"),
            interests=json.dumps(profile_data.get("keywords", [])),
            skills=json.dumps(profile_data.get("skills", [])),
            languages=json.dumps(profile_data.get("languages", [])),
            availability=profile_data.get("available_time"),
            publications=json.dumps(profile_data.get("publications", [])),
            previous_projects=json.dumps(profile_data.get("previous_projects", [])),
            preferred_collaborations=json.dumps([profile_data.get("preferred_project_size", "Medium")]),
            focus_countries=json.dumps([profile_data.get("country")]),
            embedding=emb_binary,
            raw_json=json.dumps(profile_data),
            lang=session.lang
        )
        db.add(db_res)
        
    else:
        search_text = (
            f"Project Title: {profile_data.get('project_title')}\n"
            f"Sector: {profile_data.get('sector')}\n"
            f"Description: {profile_data.get('problem')}\n"
            f"Required Skills: {', '.join(profile_data.get('required_skills', []))}\n"
            f"Location: {profile_data.get('preferred_location')}"
        )
        emb_vector = get_embedding(search_text)
        emb_binary = json.dumps(emb_vector).encode('utf-8')
        
        db_proj = Project(
            user_id=current_user.id,
            organization=profile_data.get("organization", "Anonymous Owner"),
            title=profile_data.get("project_title"),
            description=profile_data.get("problem"),
            required_skills=json.dumps(profile_data.get("required_skills", [])),
            budget=profile_data.get("budget"),
            timeline=profile_data.get("timeline"),
            impact=json.dumps(profile_data.get("expected_impact", {})),
            location=profile_data.get("preferred_location"),
            sector=profile_data.get("sector"),
            sdgs=json.dumps(profile_data.get("sdgs", [])),
            priority=profile_data.get("priority", "Medium"),
            embedding=emb_binary,
            raw_json=json.dumps(profile_data),
            lang=session.lang
        )
        db.add(db_proj)
        
    db.commit()
    
    if session.user_type == "researcher":
        db.refresh(db_res)
        sync_researcher_translation(db_res, db)
    else:
        db.refresh(db_proj)
        sync_project_translation(db_proj, db)
        
    res_data = {"message": "Chat profile successfully linked to account"}
    if session.user_type == "project_owner":
        res_data["project_id"] = db_proj.id
    return res_data

# --- CHAT & REGISTRATION ENDPOINTS ---

@app.post("/api/chat/start")
def start_chat(user_type: Optional[str] = None, lang: Optional[str] = "en", db: Session = Depends(get_db)):
    """
    Initializes a new chat session and returns a session ID and initial greeting.
    """
    session_id = str(uuid.uuid4())
    
    welcome_text = (
        "Welcome to **CollabBridge AI**! 🌍\n\n"
        "This platform connects academic researchers with high-impact societal reconstruction projects in Syria.\n\n"
        "To get started, please let me know: **Are you a Researcher** looking to collaborate, or a **Project Owner** seeking research expertise for a project?"
    )
    if lang == "ar":
        welcome_text = (
            "مرحباً بك في **CollabBridge AI**! 🌍\n\n"
            "تصل هذه المنصة بين الباحثين الأكاديميين ومشاريع إعادة الإعمار في سوريا.\n\n"
            "للبدء، يرجى إعلامي: **هل أنت باحث** تتطلع للتعاون، أم **صاحب مشروع** تبحث عن خبرة بحثية لمشروع؟"
        )
    
    history = []
    
    if user_type == "researcher":
        if lang == "ar":
            welcome_text = (
                "أهلاً وسهلاً بك! 🎓 يسعدني لقاؤك! أنا هنا لمساعدتك في بناء ملفك التعريفي كخبير أكاديمي على منصة CollabBridge.\n\n"
                "سأجري معك مقابلة قصيرة وممتعة لنتعرف على خلفيتك الأكاديمية، واهتماماتك البحثية، ومهاراتك التقنية، ومدى توفرك للتعاون في مشاريع إعادة إعمار سوريا.\n\n"
                "دعنا نبدأ! **ما هو اسمك الكامل وما هو منصبك الأكاديمي أو المهني الحالي؟**"
            )
        else:
            welcome_text = (
                "Hello and welcome! 🎓 It is truly wonderful to have you here! I am your CollabBridge interview assistant, and I am here to help build your expert profile.\n\n"
                "I will walk you through a friendly conversation to learn about your academic background, research passions, technical skills, and availability for collaboration on Syria's reconstruction projects.\n\n"
                "Let's dive in! **What is your full name and your current academic or professional position?**"
            )
        active_agent = "researcher_interview"
    elif user_type == "project_owner":
        if lang == "ar":
            welcome_text = (
                "أهلاً وسهلاً بك! 🏗️ يسعدني جداً أنك هنا! أنا مساعد المقابلات في CollabBridge وسأساعدك في تسجيل مشروعك الإعماري.\n\n"
                "سنتحدث سوياً في مقابلة قصيرة وممتعة لأتعرف على تفاصيل المشروع، والتحديات التي يواجهها، والميزانية، والجدول الزمني، والمهارات الأكاديمية المطلوبة.\n\n"
                "هيا بنا! **ما هو عنوان مشروعك وما هو القطاع الذي يغطيه؟** (مثلاً: البنية التحتية، المياه، الطاقة، الزراعة)"
            )
        else:
            welcome_text = (
                "Hello and welcome! 🏗️ I am so glad you are here! I am your CollabBridge interview assistant, and I am excited to help you register your reconstruction project.\n\n"
                "We will have a friendly conversation where I will learn about your project's goals, the challenges it addresses, budget, timeline, and the expert skills you need.\n\n"
                "Let's get started! **What is the title of your project and which sector does it cover?** (e.g., Infrastructure, Water, Energy, Agriculture)"
            )
        active_agent = "project_interview"
    else:
        user_type = None
        active_agent = "manager"

    history.append({"role": "assistant", "content": welcome_text})
    
    session = ChatSession(
        session_id=session_id,
        user_type=user_type,
        active_agent=active_agent,
        chat_history=json.dumps(history),
        extracted_profile=json.dumps({}),
        completed=False,
        lang=lang
    )
    db.add(session)
    db.commit()
    
    return {
        "session_id": session_id,
        "response": welcome_text,
        "active_agent": active_agent,
        "completed": False,
        "profile": {},
        "options": (
            ["I am a Researcher", "I am a Project Owner"] if lang != "ar"
            else ["أنا باحث", "أنا صاحب مشروع"]
        ) if active_agent == "manager" else None
    }

@app.post("/api/chat/message", response_model=ChatResponse)
async def post_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Posts a user message to the conversation session, runs orchestrator logic, and returns the response.
    """
    try:
        response = await handle_message(request.session_id, request.message, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/status/{session_id}")
def get_chat_status(session_id: str, db: Session = Depends(get_db)):
    """
    Checks the status of the interview and returns the current extracted profile.
    """
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "session_id": session_id,
        "user_type": session.user_type,
        "active_agent": session.active_agent,
        "completed": session.completed,
        "profile": session.get_profile(),
        "history": session.get_history()
    }

# --- DATABASE SEEDING ---

@app.post("/api/db/seed")
def seed_db(db: Session = Depends(get_db)):
    """
    Seeds the SQLite database with 50 researchers and 30 Syrian projects.
    """
    try:
        seed_database(db)
        return {"status": "success", "message": "Database seeded successfully with 50 researchers and 30 projects."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seeding failed: {str(e)}")

@app.post("/api/db/clear-demo")
def clear_demo_db(db: Session = Depends(get_db)):
    """
    Removes synthetic/demo data (where is_demo is True or user_id is NULL) from the database.
    """
    try:
        deleted_projects = db.query(Project).filter((Project.is_demo == True) | (Project.user_id == None)).delete()
        deleted_researchers = db.query(Researcher).filter((Researcher.is_demo == True) | (Researcher.user_id == None)).delete()
        db.commit()
        return {
            "status": "success",
            "message": f"Successfully removed demo data. Deleted {deleted_projects} projects and {deleted_researchers} researchers."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database clearing failed: {str(e)}")

@app.get("/api/db/status")
def get_db_status(db: Session = Depends(get_db)):
    """
    Checks database status and returns configuration settings.
    """
    has_demo_projects = db.query(Project).filter((Project.is_demo == True) | (Project.user_id == None)).first() is not None
    has_demo_researchers = db.query(Researcher).filter((Researcher.is_demo == True) | (Researcher.user_id == None)).first() is not None
    return {
        "has_demo": has_demo_projects or has_demo_researchers,
        "google_client_id": settings.GOOGLE_CLIENT_ID
    }



# --- RESEARCHERS & PROJECTS SEARCH ---

@app.get("/api/researchers")
def list_researchers(
    q: Optional[str] = None, 
    country: Optional[str] = None, 
    lang: Optional[str] = "en",
    db: Session = Depends(get_db)
):
    """
    Lists all researchers in the database. Supports search querying.
    """
    query = db.query(Researcher).filter(Researcher.lang == lang)
    if country:
        query = query.filter(Researcher.country.ilike(f"%{country}%"))
    
    researchers = query.all()
    results = [r.to_dict() for r in researchers]
    
    if q:
        q_lower = q.lower()
        results = [
            r for r in results 
            if q_lower in r["name"].lower() 
            or q_lower in r["expertise"].lower() 
            or any(q_lower in sk.lower() for sk in r["skills"])
        ]
        
    return results

@app.get("/api/projects")
def list_projects(
    sector: Optional[str] = None, 
    q: Optional[str] = None, 
    lang: Optional[str] = "en",
    db: Session = Depends(get_db)
):
    """
    Lists all projects in the database.
    """
    query = db.query(Project).filter(Project.lang == lang)
    if sector:
        query = query.filter(Project.sector.ilike(f"%{sector}%"))
        
    projects = query.all()
    results = [p.to_dict() for p in projects]
    
    if q:
        q_lower = q.lower()
        results = [
            p for p in results
            if q_lower in p["title"].lower()
            or q_lower in p["description"].lower()
            or q_lower in p["sector"].lower()
        ]
        
    return results

@app.get("/api/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full details for a single project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.to_dict()

# --- MATCHING & MULTI-AGENT ANALYSIS ENDPOINTS ---

@app.get("/api/projects/{project_id}/matches")
def get_project_matches(
    project_id: int, 
    limit: int = 5, 
    db: Session = Depends(get_db)
):
    """
    Agent 5 (Matching Agent): Returns the top 5 matched researchers for the project.
    """
    try:
        matches = match_project_with_researchers(project_id, db, limit)
        return matches
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/team")
def get_project_team(project_id: int, db: Session = Depends(get_db)):
    """
    Agent 6 (Team Builder Agent): Recommends a multidisciplinary team.
    """
    try:
        team = build_multidisciplinary_team(project_id, db)
        return team
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/proposal")
def get_project_proposal(project_id: int, db: Session = Depends(get_db)):
    """
    Agent 7 (Proposal Generator): Generates a detailed collaboration proposal.
    """
    try:
        proposal_markdown = generate_collaboration_proposal(project_id, db)
        return {"proposal": proposal_markdown}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/impact")
def get_project_impact(project_id: int, db: Session = Depends(get_db)):
    """
    Agent 8 (Impact Assessment Agent): Performs multi-dimensional societal impact analysis.
    """
    try:
        impact = assess_project_impact(project_id, db)
        return impact
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/recommendations")
def get_project_recs(project_id: int, db: Session = Depends(get_db)):
    """
    Agent 9 (Recommendation Agent): Generates actionable suggestions.
    """
    try:
        recommendations = generate_project_recommendations(project_id, db)
        return {"recommendations": recommendations}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
def post_translate(data: Dict[str, str]):
    """
    Agent 10 (Translation Agent): Translates English text to Arabic.
    """
    text = data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text field cannot be empty")
    try:
        return translate_en_to_ar(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ANALYTICS DASHBOARD DATA ---

@app.get("/api/analytics")
def get_analytics(lang: Optional[str] = "en", db: Session = Depends(get_db)):
    """
    Compiles analytics statistics for the frontend dashboard widgets and charts.
    """
    total_researchers = db.query(Researcher).filter(Researcher.lang == lang).count()
    total_projects = db.query(Project).filter(Project.lang == lang).count()
    
    # Sector distributions
    projects = db.query(Project).filter(Project.lang == lang).all()
    sectors = [p.sector for p in projects if p.sector]
    sector_counts = dict(Counter(sectors))
    
    # SDG distributions
    sdg_list = []
    for p in projects:
        if p.sdgs:
            try:
                sdg_list.extend(json.loads(p.sdgs))
            except:
                pass
    sdg_counts = dict(Counter(sdg_list))
    
    # Geographic distributions (where researchers come from)
    researchers = db.query(Researcher).filter(Researcher.lang == lang).all()
    countries = [r.country for r in researchers if r.country]
    country_counts = dict(Counter(countries))
    
    # Top expertise areas
    skills_list = []
    for r in researchers:
        if r.skills:
            try:
                # Add first 2 skills/interests to list
                skills_list.extend(json.loads(r.skills)[:3])
            except:
                pass
    top_skills = dict(Counter(skills_list).most_common(10))

    # Collaborations mapping: matched links for visualization
    # We will simulate a quick graph: list of projects, their top matched researcher institution
    collab_links = []
    for p in projects[:5]: # Take first 5 projects for demo graph links
        try:
            matches = match_project_with_researchers(p.id, db, limit=2, explain=False)
            for m in matches:
                collab_links.append({
                    "project_title": p.title,
                    "sector": p.sector,
                    "researcher_name": m["researcher_name"],
                    "institution": m["institution"],
                    "researcher_country": m["country"],
                    "score": m["score"]
                })
        except:
            pass
    return {
        "summary": {
            "total_researchers": total_researchers,
            "total_projects": total_projects,
            "total_matches_computed": total_projects * total_researchers if total_projects else 0
        },
        "sectors": sector_counts,
        "sdgs": sdg_counts,
        "countries": country_counts,
        "top_skills": top_skills,
        "collaborations": collab_links
    }

# --- FUNDING RESOURCES & NOTIFICATIONS ---

from app.database import FundingNotification

@app.get("/api/funding/search")
def search_funding(
    project_id: Optional[int] = Query(None), 
    researcher_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Agent 11 (Funding Agent): Searches the internet to find funding opportunities
    related to the project or researcher. If a researcher has notifications enabled, 
    auto-logs a notification in the database.
    """
    from app.agents.funding_agent import find_funding_opportunities
    try:
        opportunities = find_funding_opportunities(project_id, researcher_id, db)
        return {"status": "success", "opportunities": opportunities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Funding agent search failed: {str(e)}")

@app.get("/api/funding/notifications/{researcher_id}")
def list_funding_notifications(researcher_id: int, db: Session = Depends(get_db)):
    """
    Lists all funding notification logs for a specific researcher.
    """
    notifications = db.query(FundingNotification)\
        .filter(FundingNotification.researcher_id == researcher_id)\
        .order_by(FundingNotification.sent_at.desc()).all()
    return [n.to_dict() for n in notifications]

@app.post("/api/funding/notifications/{notification_id}/read")
def mark_funding_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """
    Marks a funding notification as read.
    """
    notif = db.query(FundingNotification).filter(FundingNotification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "success", "message": "Notification marked as read"}
