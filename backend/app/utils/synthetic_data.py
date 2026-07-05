import json
import logging
import random
from sqlalchemy.orm import Session
from app.database import Researcher, Project, Base, engine, SessionLocal
from app.utils.embeddings import get_embedding, get_embeddings_batch

logger = logging.getLogger(__name__)

# List of 5 Hand-Crafted English Researchers
RESEARCHERS_TEMPLATE = [
    {
        "name": "Dr. Ahmad Al-Masri",
        "institution": "Damascus University",
        "country": "Syria",
        "department": "Civil Engineering",
        "position": "Associate Professor",
        "expertise": "Structural engineering and seismic design of low-cost concrete housing.",
        "keywords": ["Civil Engineering", "Structural Analysis", "Seismic Design", "Rubble recycling"],
        "publications": ["Seismic performance of reinforced concrete in post-conflict zones (2024)", "Recycled aggregate concrete for local housing (2022)"],
        "previous_projects": ["Structural assessment of heritage buildings in Old Damascus", "Rubble concrete reuse pilot in Homs"],
        "programming_languages": ["Python", "MATLAB"],
        "software_skills": ["SAP2000", "ETABS", "AutoCAD"],
        "laboratory_facilities": ["Concrete stress testing laboratory", "Seismic simulation shaker"],
        "available_time": "15 hrs/week",
        "funding_expectations": "Partial funding",
        "preferred_project_size": "Medium",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [9, 11],
        "humanitarian_work_interest": True,
        "languages": ["Arabic", "English"]
    },
    {
        "name": "Dr. Maya Khoury",
        "institution": "American University of Beirut",
        "country": "Lebanon",
        "department": "Water Resources Engineering",
        "position": "Professor",
        "expertise": "Drought management, smart irrigation networks, and wastewater reuse in semi-arid zones.",
        "keywords": ["Water Management", "Irrigation", "Hydrology", "Wastewater reuse"],
        "publications": ["Drip irrigation optimization in Mediterranean climate (2023)", "Aquifer recharge under drought conditions (2021)"],
        "previous_projects": ["Beqaa Valley Drip Irrigation Initiative", "Greywater recycling in rural schools"],
        "programming_languages": ["Python", "R"],
        "software_skills": ["ArcGIS", "EPANET", "MODFLOW"],
        "laboratory_facilities": ["Water quality testing laboratory", "Spectrophotometer"],
        "available_time": "10 hrs/week",
        "funding_expectations": "Unfunded",
        "preferred_project_size": "Large",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [6, 13, 15],
        "humanitarian_work_interest": True,
        "languages": ["Arabic", "English", "French"]
    },
    {
        "name": "Dr. Samer Haddad",
        "institution": "Technical University of Munich",
        "country": "Germany",
        "department": "Electrical & Computer Engineering",
        "position": "Postdoctoral Researcher",
        "expertise": "Microgrid control, solar battery storage systems, and remote telemetry.",
        "keywords": ["Renewable Energy", "Microgrids", "Solar PV", "Battery Storage"],
        "publications": ["Decentralized control of PV-Battery microgrids in off-grid villages (2025)"],
        "previous_projects": ["Bavarian rural microgrid simulation", "Solar kiosk network in East Africa"],
        "programming_languages": ["Python", "C++", "Julia"],
        "software_skills": ["MATLAB Simulink", "HOMER Pro", "PSCADA"],
        "laboratory_facilities": ["Power Hardware-in-the-Loop simulator"],
        "available_time": "20 hrs/week",
        "funding_expectations": "Grant supported",
        "preferred_project_size": "Medium",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [7, 13],
        "humanitarian_work_interest": True,
        "languages": ["Arabic", "English", "German"]
    },
    {
        "name": "Dr. Sarah Dupont",
        "institution": "University of Cambridge",
        "country": "United Kingdom",
        "department": "Land Economy",
        "position": "Senior Lecturer",
        "expertise": "Post-conflict economic recovery, urban property rights, and micro-finance policies.",
        "keywords": ["Economic Development", "Property Rights", "Urban Planning", "SME recovery"],
        "publications": ["Land registries and title restoration in post-conflict states (2023)"],
        "previous_projects": ["Urban economic assessment in Mosul", "Balkans land registry digitization advisory"],
        "programming_languages": ["R", "Stata"],
        "software_skills": ["QGIS", "SPSS"],
        "laboratory_facilities": [],
        "available_time": "8 hrs/week",
        "funding_expectations": "Unfunded",
        "preferred_project_size": "Small",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [1, 8, 11],
        "humanitarian_work_interest": True,
        "languages": ["English", "French"]
    },
    {
        "name": "Eng. Tariq Al-Youssef",
        "institution": "Aleppo University",
        "country": "Syria",
        "department": "Mechanical Engineering",
        "position": "Lecturer & Ph.D. Candidate",
        "expertise": "Low-cost machinery design, plastic shredders, and local manufacturing technologies.",
        "keywords": ["Mechanical Design", "Plastic Recycling", "Local Manufacturing"],
        "publications": ["Local manufacturing of small-scale recycling shredders (2024)"],
        "previous_projects": ["Aleppo workshop restoration", "Medical waste autoclave locally built prototype"],
        "programming_languages": ["C", "Python"],
        "software_skills": ["SolidWorks", "ANSYS", "AutoCAD"],
        "laboratory_facilities": ["Aleppo University engineering workshop"],
        "available_time": "15 hrs/week",
        "funding_expectations": "Partial funding",
        "preferred_project_size": "Small",
        "remote_collaboration": False,
        "international_collaboration": True,
        "sdgs": [9, 12],
        "humanitarian_work_interest": True,
        "languages": ["Arabic", "English"]
    }
]

# We will generate up to 50 researchers programmatically based on template expansion to make the data rich
def generate_50_researchers() -> list:
    disciplines = [
        ("Civil Engineering", ["Structural Analysis", "Concrete recycling", "Earthquake resistant design", "Rubble assessment"]),
        ("Environmental Engineering", ["Solid waste management", "Plastic recycling", "Water filtration", "Landfill optimization"]),
        ("Agriculture / Agronomy", ["Drought-resistant crops", "Olive oil yield optimization", "Smart greenhouses", "Precision farming"]),
        ("Medical Sciences / Telemedicine", ["Telehealth", "Mobile clinics", "Rural diagnostics", "Digital health databases"]),
        ("Computer Science / AI", ["Computer Vision", "GIS modelling", "Rubble classification using AI", "Edge servers", "Offline databases"]),
        ("Renewable Energy", ["Solar PV", "Microgrids", "Wind assessment", "Battery storage"]),
        ("Archaeology & Heritage", ["Heritage restoration", "Digital archaeology", "3D scanning", "Museum digitization"]),
        ("Economics & Policy", ["SME recovery", "Youth employment", "Micro-loans", "Supply chain logistics"])
    ]
    
    first_names = ["Firas", "Rania", "Zain", "Lina", "Bassam", "Huda", "Karam", "Nour", "Riad", "Dina", "Hasan", "Salma", "Youssef", "Ghalia", "Adnan"]
    last_names = ["Al-Ali", "Shaheen", "Fares", "Saleh", "Rizk", "Hariri", "Suleiman", "Jradi", "Kabbani", "Daghestani", "Bitar", "Ghanem", "Assaf"]
    countries = [("Syria", "Damascus University"), ("Syria", "Aleppo University"), ("Syria", "Tishreen University"), ("Germany", "TU Berlin"), ("France", "Sorbonne"), ("USA", "MIT"), ("Jordan", "University of Jordan"), ("UAE", "Sharjah University"), ("Sweden", "KTH")]

    researchers = []
    
    # Add initial 5 high-fidelity hand-crafted researchers
    researchers.extend(RESEARCHERS_TEMPLATE)
    
    # Generate 45 more
    random.seed(42) # Deterministic data seeding
    
    for i in range(45):
        fname = random.choice(first_names)
        kind_name = random.choice(last_names)
        name = f"Dr. {fname} {kind_name}"
        
        country, inst = random.choice(countries)
        if country != "Syria" and random.random() > 0.5:
            # Diaspora
            name += " (Diaspora)"
            
        discipline, keywords = random.choice(disciplines)
        pos = random.choice(["Professor", "Associate Professor", "Assistant Professor", "PhD Candidate", "Senior Researcher"])
        
        selected_kws = random.sample(keywords, min(len(keywords), 3)) + ["Syrian reconstruction", "SDG Alignment"]
        
        avail = f"{random.choice([5, 10, 15, 20])} hrs/week"
        fund = random.choice(["Unfunded", "Partial funding", "Grant supported"])
        
        # Publications
        pub_topics = [f"Rebuilding {discipline} structures in post-war Middle East", f"Sustainable {discipline} frameworks for Syria (2025)"]
        
        researchers.append({
            "name": name,
            "institution": inst,
            "country": country,
            "department": discipline,
            "position": pos,
            "expertise": f"Expert in {discipline} focusing on {', '.join(selected_kws).lower()}.",
            "keywords": selected_kws,
            "publications": pub_topics,
            "previous_projects": [f"Pilot on {selected_kws[0]} in rural communities"],
            "programming_languages": ["Python"] if random.random() > 0.3 else ["R", "MATLAB"],
            "software_skills": ["QGIS", "Excel"] if random.random() > 0.5 else ["MATLAB", "ArcGIS"],
            "laboratory_facilities": ["Field testing kit"] if random.random() > 0.5 else [],
            "available_time": avail,
            "funding_expectations": fund,
            "preferred_project_size": random.choice(["Small", "Medium", "Large"]),
            "remote_collaboration": True,
            "international_collaboration": True,
            "sdgs": [random.choice([1, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15])],
            "humanitarian_work_interest": True,
            "languages": ["Arabic", "English"] if country == "Syria" or random.random() > 0.4 else ["English"]
        })
        
    return researchers

# 5 Hand-crafted Arabic Researchers
RESEARCHERS_TEMPLATE_AR = [
    {
        "name": "د. أحمد المصري",
        "institution": "جامعة دمشق",
        "country": "سوريا",
        "department": "الهندسة المدنية",
        "position": "أستاذ مشارك",
        "expertise": "الهندسة الإنشائية والتصميم المقاوم للزلازل للمساكن الخرسانية منخفضة التكلفة.",
        "keywords": ["الهندسة المدنية", "التحليل الإنشائي", "التصميم الزلزالي", "إعادة تدوير الأنقاض"],
        "publications": ["الأداء الزلزالي للخرسانة المسلحة في مناطق ما بعد النزاع (2024)", "خرسانة الركام المعاد تدويرها للمساكن المحلية (2022)"],
        "previous_projects": ["التقييم الإنشائي للمباني التراثية في دمشق القديمة", "مشروع ريادي لإعادة استخدام أنقاض الخرسانة في حمص"],
        "programming_languages": ["Python", "MATLAB"],
        "software_skills": ["SAP2000", "ETABS", "AutoCAD"],
        "laboratory_facilities": ["مختبر اختبار إجهاد الخرسانة", "هزاز محاكاة زلزالية"],
        "available_time": "15 ساعة/أسبوع",
        "funding_expectations": "تمويل جزئي",
        "preferred_project_size": "Medium",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [9, 11],
        "humanitarian_work_interest": True,
        "languages": ["العربية", "الإنجليزية"]
    },
    {
        "name": "د. مايا خوري",
        "institution": "الجامعة الأمريكية في بيروت",
        "country": "لبنان",
        "department": "هندسة الموارد المائية",
        "position": "أستاذ",
        "expertise": "إدارة الجفاف، شبكات الري الذكية، وإعادة استخدام مياه الصرف الصحي في المناطق شبه الجافة.",
        "keywords": ["إدارة المياه", "الري", "الهيدرولوجيا", "إعادة استخدام المياه"],
        "publications": ["تحسين الري بالتنقيط في المناخ المتوسطي (2023)", "إعادة شحن المياه الجوفية في ظروف الجفاف (2021)"],
        "previous_projects": ["مبادرة الري بالتنقيط في سهل البقاع", "إعادة تدوير المياه الرمادية في المدارس الريفية"],
        "programming_languages": ["Python", "R"],
        "software_skills": ["ArcGIS", "EPANET", "MODFLOW"],
        "laboratory_facilities": ["مختبر فحص جودة المياه", "مطياف ضوئي"],
        "available_time": "10 ساعات/أسبوع",
        "funding_expectations": "بدون تمويل",
        "preferred_project_size": "Large",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [6, 13, 15],
        "humanitarian_work_interest": True,
        "languages": ["العربية", "الإنجليزية", "الفرنسية"]
    },
    {
        "name": "د. سامر حداد",
        "institution": "جامعة ميونخ التقنية",
        "country": "ألمانيا",
        "department": "الهندسة الكهربائية وهندسة الكمبيوتر",
        "position": "باحث ما بعد الدكتوراه",
        "expertise": "التحكم في الشبكات الصغيرة، أنظمة تخزين بطاريات الطاقة الشمسية، والقياس البعيد.",
        "keywords": ["الطاقة المتجددة", "الشبكات الصغيرة", "الطاقة الشمسية", "تخزين البطاريات"],
        "publications": ["التحكم اللامركزي في الشبكات الصغيرة الكهروضوئية في القرى غير المرتبطة بالشبكة (2025)"],
        "previous_projects": ["محاكاة الشبكة الصغيرة الريفية البافارية", "شبكة أكشاك الطاقة الشمسية في شرق إفريقيا"],
        "programming_languages": ["Python", "C++", "Julia"],
        "software_skills": ["MATLAB Simulink", "HOMER Pro", "PSCADA"],
        "laboratory_facilities": ["محاكي الطاقة في الحلقة الكهربائية"],
        "available_time": "20 ساعة/أسبوع",
        "funding_expectations": "مدعوم بمنحة",
        "preferred_project_size": "Medium",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [7, 13],
        "humanitarian_work_interest": True,
        "languages": ["العربية", "الإنجليزية", "الألمانية"]
    },
    {
        "name": "د. سارة ديبونت",
        "institution": "جامعة كامبريدج",
        "country": "المملكة المتحدة",
        "department": "الاقتصاد العقاري",
        "position": "محاضر أول",
        "expertise": "التعافي الاقتصادي بعد الصراعات، حقوق الملكية الحضرية، وسياسات التمويل الأصغر.",
        "keywords": ["التنمية الاقتصادية", "حقوق الملكية", "التخطيط الحضري", "تعافي الشركات الصغيرة والمتوسطة"],
        "publications": ["سجلات الأراضي واستعادة الملكية في دول ما بعد الصراع (2023)"],
        "previous_projects": ["التقييم الاقتصادي الحضري في الموصل", "استشاري رقمنة سجلات الأراضي في البلقان"],
        "programming_languages": ["R", "Stata"],
        "software_skills": ["QGIS", "SPSS"],
        "laboratory_facilities": [],
        "available_time": "8 ساعات/أسبوع",
        "funding_expectations": "بدون تمويل",
        "preferred_project_size": "Small",
        "remote_collaboration": True,
        "international_collaboration": True,
        "sdgs": [1, 8, 11],
        "humanitarian_work_interest": True,
        "languages": ["الإنجليزية", "الفرنسية"]
    },
    {
        "name": "المهندس طارق اليوسف",
        "institution": "جامعة حلب",
        "country": "سوريا",
        "department": "الهندسة الميكانيكية",
        "position": "محاضر وطالب دكتوراه",
        "expertise": "تصميم الآلات منخفضة التكلفة، آلات تقطيع البلاستيك، وتقنيات التصنيع المحلية.",
        "keywords": ["التصميم الميكانيكي", "إعادة تدوير البلاستيك", "التصنيع المحلي"],
        "publications": ["التصنيع المحلي لآلات تقطيع إعادة التدوير صغيرة الحجم (2024)"],
        "previous_projects": ["ترميم ورشة حلب", "نموذج أولي محلي لجهاز تعقيم النفايات الطبية"],
        "programming_languages": ["C", "Python"],
        "software_skills": ["SolidWorks", "ANSYS", "AutoCAD"],
        "laboratory_facilities": ["ورشة الهندسة بجامعة حلب"],
        "available_time": "15 ساعة/أسبوع",
        "funding_expectations": "تمويل جزئي",
        "preferred_project_size": "Small",
        "remote_collaboration": False,
        "international_collaboration": True,
        "sdgs": [9, 12],
        "humanitarian_work_interest": True,
        "languages": ["العربية", "الإنجليزية"]
    }
]

def generate_50_researchers_ar() -> list:
    disciplines = [
        ("الهندسة المدنية", ["التحليل الإنشائي", "إعادة تدوير الخرسانة", "التصميم المقاوم للزلازل", "تقييم الأنقاض"]),
        ("الهندسة البيئية", ["إدارة النفايات الصلبة", "إعادة تدوير البلاستيك", "تنقية المياه", "تحسين المكبات"]),
        ("العلوم الزراعية", ["المحاصيل المقاومة للجفاف", "إنتاج زيت الزيتون", "البيوت الزجاجية الذكية", "الزراعة الدقيقة"]),
        ("العلوم الطبية / الطب عن بعد", ["الرعاية الصحية عن بعد", "العيادات المتنقلة", "التشخيص الريفي", "قواعد بيانات الصحة"]),
        ("علوم الكمبيوتر / الذكاء الاصطناعي", ["الرؤية الحاسوبية", "نظم المعلومات الجغرافية", "تصنيف الأنقاض", "الخوادم الطرفية", "قواعد البيانات"]),
        ("الطاقة المتجددة", ["الخلايا الشمسية", "الشبكات الصغيرة", "طاقة الرياح", "تخزين البطاريات"]),
        ("الآثار والتراث", ["ترميم التراث", "علم الآثار الرقمي", "المسح ثلاثي الأبعاد", "رقمنة المتاحف"]),
        ("الاقتصاد والسياسات", ["تعافي المشاريع", "توظيف الشباب", "القروض الصغيرة", "لوجستيات الإمداد"])
    ]
    
    first_names = ["فراس", "رانيا", "زين", "لينا", "بسام", "هدى", "كرم", "نور", "رياض", "دينا", "حسن", "سلمى", "يوسف", "غالية", "عدنان"]
    last_names = ["العلي", "شاهين", "فارس", "صالح", "رزق", "الحريري", "سليمان", "جرادي", "قباني", "الداغستاني", "البيطار", "غانم", "عساف"]
    countries = [("سوريا", "جامعة دمشق"), ("سوريا", "جامعة حلب"), ("سوريا", "جامعة تشرين"), ("ألمانيا", "جامعة برلين التقنية"), ("فرنسا", "جامعة السوربون"), ("الولايات المتحدة", "معهد ماساتشوستس للتقنية"), ("الأردن", "الجامعة الأردنية"), ("الإمارات", "جامعة الشارقة"), ("السويد", "المعهد الملكي للتكنولوجيا")]

    researchers = []
    researchers.extend(RESEARCHERS_TEMPLATE_AR)
    
    random.seed(42)
    
    for i in range(45):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        name = f"د. {fname} {lname}"
        
        country, inst = random.choice(countries)
        if country != "سوريا" and random.random() > 0.5:
            name += " (مغترب)"
            
        discipline, keywords = random.choice(disciplines)
        pos = random.choice(["أستاذ", "أستاذ مشارك", "أستاذ مساعد", "طالب دكتوراه", "باحث رئيسي"])
        
        selected_kws = random.sample(keywords, min(len(keywords), 3)) + ["إعادة إعمار سوريا", "التنمية المستدامة"]
        avail = f"{random.choice([5, 10, 15, 20])} ساعة/أسبوع"
        fund = random.choice(["بدون تمويل", "تمويل جزئي", "مدعوم بمنحة"])
        
        pub_topics = [f"إعادة بناء الهياكل في {discipline} في الشرق الأوسط", f"أطر العمل المستدامة في {discipline} في سوريا (2025)"]
        
        researchers.append({
            "name": name,
            "institution": inst,
            "country": country,
            "department": discipline,
            "position": pos,
            "expertise": f"خبير في {discipline} يركز على {', '.join(selected_kws)}.",
            "keywords": selected_kws,
            "publications": pub_topics,
            "previous_projects": [f"مشروع ريادي حول {selected_kws[0]} في المجتمعات الريفية"],
            "programming_languages": ["Python"] if random.random() > 0.3 else ["R", "MATLAB"],
            "software_skills": ["QGIS", "Excel"] if random.random() > 0.5 else ["MATLAB", "ArcGIS"],
            "laboratory_facilities": ["حقيبة فحص ميدانية"] if random.random() > 0.5 else [],
            "available_time": avail,
            "funding_expectations": fund,
            "preferred_project_size": random.choice(["Small", "Medium", "Large"]),
            "remote_collaboration": True,
            "international_collaboration": True,
            "sdgs": [random.choice([1, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15])],
            "humanitarian_work_interest": True,
            "languages": ["العربية", "الإنجليزية"] if country == "سوريا" or random.random() > 0.4 else ["الإنجليزية"]
        })
        
    return researchers

# English Projects Template
PROJECTS_TEMPLATE = [
    {
        "organization": "Syrian Reconstruction Trust Fund (SRTF)",
        "project_title": "Aleppo Concrete Rubble Recycling and Aggregate Reclamation",
        "sector": "Infrastructure",
        "problem": "Large quantities of construction rubble from damaged residential areas block transport and redevelopment. The goal is to set up low-cost crushers to turn rubble into building aggregate.",
        "required_skills": ["Civil Engineering", "Material Science", "Concrete Recycling", "Structural Safety"],
        "budget": "$180,000",
        "timeline": "12 months",
        "preferred_location": "Aleppo, Syria",
        "sdgs": [9, 11, 12],
        "collaboration_type": "Hybrid",
        "technology_readiness_level": "TRL 6",
        "priority": "High",
        "expected_impact": {
            "social": "Allows safe rebuild of 400+ homes and clears public roads.",
            "environmental": "Prevents river dumping of rubble; reuses 85% of structural waste.",
            "economic": "Creates 40 local jobs and cuts building material costs by 40%."
        }
    },
    {
        "organization": "Syrian Environment Society",
        "project_title": "Daraa Solar-Powered Drip Irrigation and Well Management",
        "sector": "Water",
        "problem": "Daraa agriculture suffers from extreme water shortages. Traditional fuel pumps are expensive due to fuel scarcity. Need to design localized smart solar drip irrigation systems.",
        "required_skills": ["Hydrology", "Solar PV Design", "Agronomy", "IoT Sensors"],
        "budget": "$75,000",
        "timeline": "6 months",
        "preferred_location": "Daraa, Syria",
        "sdgs": [6, 7, 13],
        "collaboration_type": "Remote & Field coordinates",
        "technology_readiness_level": "TRL 5",
        "priority": "High",
        "expected_impact": {
            "social": "Restores food supply for 10,000+ local families.",
            "environmental": "Reduces groundwater overdraft by 35% using moisture sensors.",
            "economic": "Reduces farm fuel costs to zero, increasing monthly farm profit."
        }
    },
    {
        "organization": "Damascus Municipality",
        "project_title": "Historical Monument 3D Digitization & Digital Archaeology",
        "sector": "Culture",
        "problem": "Ancient sites are at risk of destruction. The project aims to capture high-resolution laser scans and 3D digital twins of historical monuments in Damascus and Aleppo.",
        "required_skills": ["Digital Archaeology", "3D Scanning", "GIS", "Heritage Conservation"],
        "budget": "$50,000",
        "timeline": "8 months",
        "preferred_location": "Damascus and Aleppo",
        "sdgs": [11, 4],
        "collaboration_type": "Hybrid",
        "technology_readiness_level": "TRL 7",
        "priority": "Medium",
        "expected_impact": {
            "social": "Preserves national identity and makes historic ruins accessible globally.",
            "environmental": "Zero environmental footprint.",
            "economic": "Sets up virtual museum apps, preparing for future tourism recovery."
        }
    }
]

def generate_30_projects() -> list:
    projects = []
    projects.extend(PROJECTS_TEMPLATE)
    
    sectors_map = [
        ("Water", "Smart leak detection in Homs city lines", ["Acoustic sensors", "Water management", "GIS"]),
        ("Energy", "Solar microgrid design for rural Ghouta clinics", ["Solar PV", "Battery Storage", "Electrical Engineering"]),
        ("Healthcare", "Telemedicine diagnosis platform for rural Idlib clinics", ["Telehealth", "Web development", "Diagnostics", "Arabic NLP"]),
        ("Education", "Offline STEM educational tutoring systems for schools", ["Software Engineering", "STEM curriculum", "Raspberry Pi caches"]),
        ("Agriculture", "Olive grove drought mitigation and disease modeling", ["Agronomy", "Plant pathology", "GIS", "Climate change"]),
        ("Transportation", "Bridge structural integrity monitoring network", ["Structural monitoring", "Sensors", "Civil Engineering"]),
        ("Housing", "Low-cost earthquake-resistant modular homes", ["Modular construction", "Earthquake engineering", "Seismic analysis"]),
        ("Environment", "Medical waste autoclave sterilization and disposal system", ["Medical waste", "Autoclave design", "Sanitation", "Health safety"]),
        ("Economy", "SME micro-loan and logistics tracking platform", ["Economics", "Logistics", "Mobile wallets", "Supply chain"]),
        ("Government", "Digital identity system for municipal registry recovery", ["Cryptography", "Database management", "Public administration"])
    ]
    
    locations = ["Homs", "Aleppo", "Damascus", "Idlib", "Lattakia", "Hama", "Deir ez-Zor", "Hasakah", "Tartus"]
    orgs = ["Local Municipal Council", "Syria Development Trust", "Red Crescent Syria", "UNDP Syria Co.", "NGO Hope Foundation"]

    random.seed(42)

    for i in range(27):
        sector, desc, skills = random.choice(sectors_map)
        loc = random.choice(locations)
        org = random.choice(orgs)
        
        title = f"{loc} {sector} Restoration: {desc.split('for')[0].strip()}"
        budget = f"${random.choice([30, 60, 100, 150, 200])},000"
        timeline = f"{random.choice([6, 9, 12, 18])} months"
        priority = random.choice(["High", "Medium", "Low"])
        
        projects.append({
            "organization": org,
            "project_title": title,
            "sector": sector,
            "problem": f"The target region of {loc} requires immediate assistance in {sector.lower()} due to localized post-war damage. {desc}. This project aims to design and implement a solution.",
            "required_skills": skills + ["Syrian reconstruction context", "Logistics"],
            "budget": budget,
            "timeline": timeline,
            "preferred_location": f"{loc}, Syria",
            "sdgs": [random.choice([1, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15])],
            "collaboration_type": random.choice(["Remote", "Hybrid", "On-site"]),
            "technology_readiness_level": f"TRL {random.choice([3, 4, 5, 6, 7])}",
            "priority": priority,
            "expected_impact": {
                "social": f"Provides critical resource access and stability to 5,000+ local residents in {loc}.",
                "environmental": "Reduces localized emissions and resources consumption through sustainable local components.",
                "economic": f"Generates {random.choice([10, 20, 30])} local engineering/construction jobs."
            }
        })
        
    return projects

# Arabic Projects Template
PROJECTS_TEMPLATE_AR = [
    {
        "organization": "الصندوق الاستئماني لإعادة إعمار سوريا (SRTF)",
        "project_title": "إعادة تدوير أنقاض الخرسانة واستصلاح الركام في حلب",
        "sector": "البنية التحتية",
        "problem": "تتراكم كميات هائلة من الأنقاض في المناطق السكنية المتضررة مما يعيق حركة المرور وإعادة الإعمار. يهدف المشروع إلى إقامة كسارات منخفضة التكلفة لتحويل الأنقاض إلى ركام إنشائي.",
        "required_skills": ["الهندسة المدنية", "علم المواد", "إعادة تدوير الخرسانة", "السلامة الإنشائية"],
        "budget": "$180,000",
        "timeline": "12 شهراً",
        "preferred_location": "حلب، سوريا",
        "sdgs": [9, 11, 12],
        "collaboration_type": "Hybrid",
        "technology_readiness_level": "TRL 6",
        "priority": "High",
        "expected_impact": {
            "social": "يسمح بإعادة الإعمار الآمن لأكثر من 400 منزل وفتح الطرق العامة.",
            "environmental": "يمنع رمي الأنقاض في الأنهار؛ يعيد استخدام 85٪ من النفايات الإنشائية.",
            "economic": "يوفر 40 فرصة عمل محلية ويخفض تكاليف المواد الإنشائية بنسبة 40٪."
        }
    },
    {
        "organization": "الجمعية السورية للبيئة",
        "project_title": "الري بالتنقيط بالطاقة الشمسية وإدارة الآبار في درعا",
        "sector": "المياه",
        "problem": "تعاني الزراعة في درعا من شح شديد في المياه. مضخات الوقود التقليدية مكلفة بسبب ندرة المحروقات. هناك حاجة لتصميم شبكات ري ذكية بالتنقيط تعمل بالطاقة الشمسية.",
        "required_skills": ["الهيدرولوجيا", "تصميم الخلايا الشمسية", "العلوم الزراعية", "مستشعرات إنترنت الأشياء"],
        "budget": "$75,000",
        "timeline": "6 أشهر",
        "preferred_location": "درعا، سوريا",
        "sdgs": [6, 7, 13],
        "collaboration_type": "Remote & Field coordinates",
        "technology_readiness_level": "TRL 5",
        "priority": "High",
        "expected_impact": {
            "social": "يستعيد إمداد الغذاء لأكثر من 10,000 عائلة محلية.",
            "environmental": "يقلل استهلاك المياه الجوفية بنسبة 35٪ باستخدام مستشعرات الرطوبة.",
            "economic": "يخفض تكاليف وقود المزارع إلى الصفر، مما يزيد الربح الشهري."
        }
    },
    {
        "organization": "بلدية دمشق",
        "project_title": "الرقمنة ثلاثية الأبعاد للمعالم الأثرية وعلم الآثار الرقمي",
        "sector": "الثقافة",
        "problem": "المواقع الأثرية مهددة بالدمار. يهدف المشروع لالتقاط صور ليزرية عالية الدقة وإنشاء توائم رقمية ثلاثية الأبعاد للمعالم التاريخية في دمشق وحلب.",
        "required_skills": ["علم الآثار الرقمي", "المسح ثلاثي الأبعاد", "نظم المعلومات الجغرافية", "ترميم التراث"],
        "budget": "$50,000",
        "timeline": "8 أشهر",
        "preferred_location": "دمشق وحلب",
        "sdgs": [11, 4],
        "collaboration_type": "Hybrid",
        "technology_readiness_level": "TRL 7",
        "priority": "Medium",
        "expected_impact": {
            "social": "يحافظ على الهوية الوطنية ويجعل الأنقاض التاريخية متاحة رقمياً حول العالم.",
            "environmental": "أثر بيئي معدوم تماماً.",
            "economic": "يؤسس تطبيقات متاحف افتراضية تحضيراً لتعافي السياحة مستقبلاً."
        }
    }
]

def generate_30_projects_ar() -> list:
    projects = []
    projects.extend(PROJECTS_TEMPLATE_AR)

    sectors_map = [
        ("المياه", "كشف تسربات المياه الذكي في شبكة مدينة حمص", ["مستشعرات صوتية", "إدارة المياه", "نظم المعلومات الجغرافية"]),
        ("الطاقة", "شبكات شمسية صغيرة لعيادات غوطة دمشق الريفية", ["الخلايا الشمسية", "تخزين البطاريات", "الهندسة الكهربائية"]),
        ("الرعاية الصحية", "منصة طبية ريفية لتشخيص المرضى في عيادات إدلب", ["الطب عن بعد", "تطوير الويب", "التشخيص الطبي", "المعالجة الطبيعية للعربية"]),
        ("التعليم", "أنظمة تعليم STEM غير متصلة بالإنترنت للمدارس", ["هندسة البرمجيات", "مناهج STEM", "الخوادم الصغيرة"]),
        ("الزراعة", "مكافحة الجفاف ونمذجة أمراض حقول الزيتون", ["العلوم الزراعية", "أمراض النبات", "نظم المعلومات الجغرافية", "التغير المناخي"]),
        ("النقل", "شبكة مراقبة السلامة الإنشائية للجسور والطرق", ["المراقبة الإنشائية", "المستشعرات", "الهندسة المدنية"]),
        ("الإسكان", "مساكن مسبقة الصنع ومقاومة للهزات الأرضية", ["البناء الجاهز", "الهندسة الزلزالية", "التحليل الإنشائي"]),
        ("البيئة", "نظام تعقيم النفايات الطبية المركزي بالبخار والتخلص منها", ["النفايات الطبية", "تصميم أجهزة التعقيم", "الإصحاح البيئي", "السلامة الصحية"]),
        ("الاقتصاد", "منصة لتتبع اللوجستيات والقروض الصغيرة للشركات الصغيرة", ["الاقتصاد", "الخدمات اللوجستية", "المحافظ الإلكترونية", "سلاسل الإمداد"]),
        ("الإدارة", "نظام الهوية الرقمية لاستعادة السجلات البلدية المتضررة", ["التشفير", "إدارة قواعد البيانات", "الإدارة العامة"])
    ]
    
    locations = ["حمص", "حلب", "دمشق", "إدلب", "اللاذقية", "حماة", "دير الزور", "الحسكة", "طرطوس"]
    orgs = ["المجلس البلدي المحلي", "الأمانة السورية للتنمية", "الهلال الأحمر السوري", "برنامج الأمم المتحدة الإنمائي", "منصة الأمل الخيرية"]

    random.seed(42)

    for i in range(27):
        sector, desc, skills = random.choice(sectors_map)
        loc = random.choice(locations)
        org = random.choice(orgs)
        
        title = f"ترميم قطاع {sector} في {loc}: {desc.split('في')[0].strip()}"
        budget = f"${random.choice([30, 60, 100, 150, 200])},000"
        timeline = f"{random.choice([6, 9, 12, 18])} شهراً"
        priority = random.choice(["High", "Medium", "Low"])
        
        projects.append({
            "organization": org,
            "project_title": title,
            "sector": sector,
            "problem": f"تتطلب منطقة {loc} مساعدة فورية في قطاع {sector} نتيجة الأضرار المحلية. {desc}. يهدف هذا المشروع لتصميم وتطبيق حل عملي.",
            "required_skills": skills + ["سياق إعادة الإعمار السوري", "الخدمات اللوجستية"],
            "budget": budget,
            "timeline": timeline,
            "preferred_location": f"{loc}، سوريا",
            "sdgs": [random.choice([1, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15])],
            "collaboration_type": random.choice(["Remote", "Hybrid", "On-site"]),
            "technology_readiness_level": f"TRL {random.choice([3, 4, 5, 6, 7])}",
            "priority": priority,
            "expected_impact": {
                "social": f"يوفر وصولاً للخدمات الضرورية والاستقرار لأكثر من 5,000 مقيم في {loc}.",
                "environmental": "يقلل الانبعاثات واستهلاك الموارد باستخدام مواد ومكونات محلية مستدامة.",
                "economic": f"يوفر {random.choice([10, 20, 30])} فرصة عمل للهندسة والإنشاءات المحلية."
            }
        })
        
    return projects

def seed_database(db: Session = None):
    """
    Clears tables, loads/generates 50 researchers & 30 projects for BOTH English and Arabic datasets,
    computes semantic embeddings, and commits to the database with corresponding lang values.
    """
    import os
    should_close = False
    if not db:
        init_db_if_needed()
        db = SessionLocal()
        should_close = True

    # Path to static data files
    dir_path = os.path.dirname(os.path.abspath(__file__))
    researchers_file = os.path.join(dir_path, "researchers.json")
    projects_file = os.path.join(dir_path, "projects.json")
    researchers_ar_file = os.path.join(dir_path, "researchers_ar.json")
    projects_ar_file = os.path.join(dir_path, "projects_ar.json")

    # 1. Self-heal/generate English static datasets if missing
    if not os.path.exists(researchers_file):
        print(f"Generating static English dataset: {researchers_file}")
        res_list = generate_50_researchers()
        for res_data in res_list:
            if "skills" not in res_data:
                res_data["skills"] = [res_data["department"]] + res_data["keywords"][:2]
        with open(researchers_file, "w", encoding="utf-8") as f:
            json.dump(res_list, f, indent=2, ensure_ascii=False)

    if not os.path.exists(projects_file):
        print(f"Generating static English dataset: {projects_file}")
        proj_list = generate_30_projects()
        with open(projects_file, "w", encoding="utf-8") as f:
            json.dump(proj_list, f, indent=2, ensure_ascii=False)

    # 2. Self-heal/generate Arabic static datasets if missing
    if not os.path.exists(researchers_ar_file):
        print(f"Generating static Arabic dataset: {researchers_ar_file}")
        res_list_ar = generate_50_researchers_ar()
        for res_data in res_list_ar:
            if "skills" not in res_data:
                res_data["skills"] = [res_data["department"]] + res_data["keywords"][:2]
        with open(researchers_ar_file, "w", encoding="utf-8") as f:
            json.dump(res_list_ar, f, indent=2, ensure_ascii=False)

    if not os.path.exists(projects_ar_file):
        print(f"Generating static Arabic dataset: {projects_ar_file}")
        proj_list_ar = generate_30_projects_ar()
        with open(projects_ar_file, "w", encoding="utf-8") as f:
            json.dump(proj_list_ar, f, indent=2, ensure_ascii=False)

    # 3. Load datasets
    try:
        with open(researchers_file, "r", encoding="utf-8") as f:
            researchers_en = json.load(f)
        with open(projects_file, "r", encoding="utf-8") as f:
            projects_en = json.load(f)
        with open(researchers_ar_file, "r", encoding="utf-8") as f:
            researchers_ar = json.load(f)
        with open(projects_ar_file, "r", encoding="utf-8") as f:
            projects_ar = json.load(f)
    except Exception as e:
        logger.error(f"Error loading static JSON files: {e}")
        raise e

    try:
        print("Clearing database tables (demo data only)...")
        db.query(Researcher).filter((Researcher.is_demo == True) | (Researcher.user_id == None)).delete()
        db.query(Project).filter((Project.is_demo == True) | (Project.user_id == None)).delete()
        db.commit()

        # Seed English Researchers
        print(f"Seeding {len(researchers_en)} English researchers...")
        res_texts_en = []
        res_records_en = []
        for res_data in researchers_en:
            if "skills" not in res_data:
                res_data["skills"] = [res_data.get("department", "Expert")] + res_data.get("keywords", [])[:2]
            if "position" not in res_data:
                res_data["position"] = "Researcher"
                
            country_val = res_data.get("country")
            is_diaspora = res_data.get("is_syrian_diaspora", False)
            if "is_syrian_diaspora" not in res_data:
                is_diaspora = country_val.lower() != "syria" and ("al-masri" in res_data.get("name", "").lower() or "khoury" in res_data.get("name", "").lower() or "haddad" in res_data.get("name", "").lower() or "diaspora" in res_data.get("name", "").lower() or "shaheen" in res_data.get("name", "").lower() or "fares" in res_data.get("name", "").lower() or "saleh" in res_data.get("name", "").lower())
            
            nationality_val = res_data.get("nationality", "Syrian" if (is_diaspora or country_val.lower() == "syria") else "International")

            search_text = (
                f"Researcher Name: {res_data.get('name')}\n"
                f"Affiliation: {res_data.get('institution')} ({res_data.get('country')})\n"
                f"Nationality: {nationality_val}\n"
                f"Residing Country: {country_val}\n"
                f"Syrian Diaspora: {'Yes' if is_diaspora else 'No'}\n"
                f"Position & Dept: {res_data.get('position')} in {res_data.get('department')}\n"
                f"Expertise Summary: {res_data.get('expertise')}\n"
                f"Keywords: {', '.join(res_data.get('keywords', []))}\n"
                f"Previous Projects: {', '.join(res_data.get('previous_projects', []))}\n"
                f"Publications: {', '.join(res_data.get('publications', []))}\n"
                f"Skills: {', '.join(res_data.get('skills', []))}"
            )
            res_texts_en.append(search_text)
            res_records_en.append((res_data, country_val, is_diaspora, nationality_val))
            
        embs_res_en = get_embeddings_batch(res_texts_en)
        
        for idx, (res_data, country_val, is_diaspora, nationality_val) in enumerate(res_records_en):
            emb_binary = json.dumps(embs_res_en[idx]).encode('utf-8')
            db_res = Researcher(
                name=res_data.get("name"),
                institution=res_data.get("institution"),
                country=country_val,
                nationality=nationality_val,
                residing_country=country_val,
                is_syrian_diaspora=is_diaspora,
                department=res_data.get("department"),
                position=res_data.get("position"),
                expertise=res_data.get("expertise"),
                interests=json.dumps(res_data.get("keywords", [])),
                skills=json.dumps(res_data.get("skills", []) + res_data.get("software_skills", []) + res_data.get("programming_languages", [])),
                languages=json.dumps(res_data.get("languages", [])),
                availability=res_data.get("available_time"),
                publications=json.dumps(res_data.get("publications", [])),
                previous_projects=json.dumps(res_data.get("previous_projects", [])),
                preferred_collaborations=json.dumps([res_data.get("preferred_project_size", "Medium")]),
                focus_countries=json.dumps([country_val]),
                embedding=emb_binary,
                raw_json=json.dumps(res_data),
                lang="en",
                is_demo=True,
                is_approved=True
            )
            db.add(db_res)

        # Seed Arabic Researchers
        print(f"Seeding {len(researchers_ar)} Arabic researchers...")
        res_texts_ar = []
        res_records_ar = []
        for res_data in researchers_ar:
            if "skills" not in res_data:
                res_data["skills"] = [res_data.get("department", "خبير")] + res_data.get("keywords", [])[:2]
            if "position" not in res_data:
                res_data["position"] = "باحث"
                
            country_val = res_data.get("country")
            is_diaspora = res_data.get("is_syrian_diaspora", False)
            if "is_syrian_diaspora" not in res_data:
                is_diaspora = country_val.lower() not in ["syria", "سوريا"] and ("المصري" in res_data.get("name", "") or "خوري" in res_data.get("name", "") or "حداد" in res_data.get("name", "") or "مغترب" in res_data.get("name", "") or "diaspora" in res_data.get("name", "").lower())
            
            nationality_val = res_data.get("nationality", "سوري" if (is_diaspora or country_val.lower() in ["syria", "سوريا"]) else "أجنبي")

            search_text = (
                f"اسم الباحث: {res_data.get('name')}\n"
                f"الجهة الأكاديمية: {res_data.get('institution')} ({res_data.get('country')})\n"
                f"الجنسية: {nationality_val}\n"
                f"بلد الإقامة: {country_val}\n"
                f"مغترب سوري: {'نعم' if is_diaspora else 'لا'}\n"
                f"المنصب والقسم: {res_data.get('position')} في {res_data.get('department')}\n"
                f"خلاصة الخبرة: {res_data.get('expertise')}\n"
                f"الكلمات المفتاحية: {', '.join(res_data.get('keywords', []))}\n"
                f"المشاريع السابقة: {', '.join(res_data.get('previous_projects', []))}\n"
                f"المنشورات العلمية: {', '.join(res_data.get('publications', []))}\n"
                f"المهارات: {', '.join(res_data.get('skills', []))}"
            )
            res_texts_ar.append(search_text)
            res_records_ar.append((res_data, country_val, is_diaspora, nationality_val))
            
        embs_res_ar = get_embeddings_batch(res_texts_ar)
        
        for idx, (res_data, country_val, is_diaspora, nationality_val) in enumerate(res_records_ar):
            emb_binary = json.dumps(embs_res_ar[idx]).encode('utf-8')
            db_res = Researcher(
                name=res_data.get("name"),
                institution=res_data.get("institution"),
                country=country_val,
                nationality=nationality_val,
                residing_country=country_val,
                is_syrian_diaspora=is_diaspora,
                department=res_data.get("department"),
                position=res_data.get("position"),
                expertise=res_data.get("expertise"),
                interests=json.dumps(res_data.get("keywords", [])),
                skills=json.dumps(res_data.get("skills", []) + res_data.get("software_skills", []) + res_data.get("programming_languages", [])),
                languages=json.dumps(res_data.get("languages", [])),
                availability=res_data.get("available_time"),
                publications=json.dumps(res_data.get("publications", [])),
                previous_projects=json.dumps(res_data.get("previous_projects", [])),
                preferred_collaborations=json.dumps([res_data.get("preferred_project_size", "Medium")]),
                focus_countries=json.dumps([country_val]),
                embedding=emb_binary,
                raw_json=json.dumps(res_data),
                lang="ar",
                is_demo=True,
                is_approved=True
            )
            db.add(db_res)

        # Seed English Projects
        print(f"Seeding {len(projects_en)} English projects...")
        proj_texts_en = []
        for proj_data in projects_en:
            search_text = (
                f"Project Title: {proj_data.get('project_title')}\n"
                f"Sector: {proj_data.get('sector')}\n"
                f"Description & Problem: {proj_data.get('problem')}\n"
                f"Required Skills: {', '.join(proj_data.get('required_skills', []))}\n"
                f"Location: {proj_data.get('preferred_location')}\n"
                f"Expected Impact: {json.dumps(proj_data.get('expected_impact', {}))}"
            )
            proj_texts_en.append(search_text)
            
        embs_proj_en = get_embeddings_batch(proj_texts_en)
        
        for idx, proj_data in enumerate(projects_en):
            emb_binary = json.dumps(embs_proj_en[idx]).encode('utf-8')
            db_proj = Project(
                organization=proj_data.get("organization", "Anonymous Owner"),
                title=proj_data.get("project_title"),
                description=proj_data.get("problem"),
                required_skills=json.dumps(proj_data.get("required_skills", [])),
                budget=proj_data.get("budget"),
                timeline=proj_data.get("timeline"),
                impact=json.dumps(proj_data.get("expected_impact", {})),
                location=proj_data.get("preferred_location"),
                sector=proj_data.get("sector"),
                sdgs=json.dumps(proj_data.get("sdgs", [])),
                priority=proj_data.get("priority", "Medium"),
                embedding=emb_binary,
                raw_json=json.dumps(proj_data),
                lang="en",
                is_demo=True,
                is_approved=True
            )
            db.add(db_proj)

        # Seed Arabic Projects
        print(f"Seeding {len(projects_ar)} Arabic projects...")
        proj_texts_ar = []
        for proj_data in projects_ar:
            search_text = (
                f"عنوان المشروع: {proj_data.get('project_title')}\n"
                f"القطاع: {proj_data.get('sector')}\n"
                f"توصيف المشكلة: {proj_data.get('problem')}\n"
                f"المهارات المطلوبة: {', '.join(proj_data.get('required_skills', []))}\n"
                f"الموقع المفضل: {proj_data.get('preferred_location')}\n"
                f"الأثر المتوقع: {json.dumps(proj_data.get('expected_impact', {}))}"
            )
            proj_texts_ar.append(search_text)
            
        embs_proj_ar = get_embeddings_batch(proj_texts_ar)
        
        for idx, proj_data in enumerate(projects_ar):
            emb_binary = json.dumps(embs_proj_ar[idx]).encode('utf-8')
            db_proj = Project(
                organization=proj_data.get("organization", "جهة غير معروفة"),
                title=proj_data.get("project_title"),
                description=proj_data.get("problem"),
                required_skills=json.dumps(proj_data.get("required_skills", [])),
                budget=proj_data.get("budget"),
                timeline=proj_data.get("timeline"),
                impact=json.dumps(proj_data.get("expected_impact", {})),
                location=proj_data.get("preferred_location"),
                sector=proj_data.get("sector"),
                sdgs=json.dumps(proj_data.get("sdgs", [])),
                priority=proj_data.get("priority", "Medium"),
                embedding=emb_binary,
                raw_json=json.dumps(proj_data),
                lang="ar",
                is_demo=True,
                is_approved=True
            )
            db.add(db_proj)

        db.commit()
        print("Successfully seeded both English and Arabic datasets!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()

def init_db_if_needed():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    seed_database()
