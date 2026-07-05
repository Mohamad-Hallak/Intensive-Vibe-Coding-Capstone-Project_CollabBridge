import json
import logging
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Predefined high-quality translations for demonstration/fallback mode
DEMO_TRANSLATIONS = {
    "we are seeking a renewable energy specialist to install off-grid solar panels in community clinics.": {
        "initial": "نحن نبحث عن أخصائي طاقة متجددة لتركيب ألواح شمسية خارج الشبكة في العيادات المجتمعية.",
        "critique": "The translation is accurate but could be more formal. 'أخصائي' (specialist) is correct. 'ألواح شمسية خارج الشبكة' (off-grid solar panels) is a literal translation; 'أنظمة طاقة شمسية مستقلة' (independent solar systems) or keeping 'خارج الشبكة' is acceptable in technical contexts. 'العيادات المجتمعية' is correct. Let's refine it for a more professional academic/NGO tone.",
        "final": "نبحث عن خبير في مجال الطاقة المتجددة لتركيب أنظمة طاقة شمسية مستقلة (خارج الشبكة) في العيادات الطبية المجتمعية.",
        "confidence": 9.8
    },
    "developing a wastewater filtration system for regional farms.": {
        "initial": "تطوير نظام ترشيح مياه الصرف الصحي للمزارع الإقليمية.",
        "critique": "The term 'ترشيح' (filtration) is correct, but 'تنقية' (purification) or 'معالجة' (treatment) is more standard for wastewater. 'المزارع الإقليمية' (regional farms) is slightly literal; 'المزارع المحلية' (local farms) or 'المزارع في المنطقة' is more natural in Arabic. Let's improve the flow.",
        "final": "تطوير نظام لمعالجة وتصفية مياه الصرف الصحي لصالح المزارع المحلية في المنطقة.",
        "confidence": 9.5
    },
    "we need researchers with expertise in seismic-resistant structural engineering to design modular houses.": {
        "initial": "نحتاج إلى باحثين لديهم خبرة في الهندسة الإنشائية المقاومة للزلازل لتصميم منازل معيارية.",
        "critique": "The translation is grammatically sound. 'هندسة إنشائية مقاومة للزلازل' is precise. 'منازل معيارية' is the translation for 'modular houses', but in Arabic civil engineering contexts, 'بيوت مسبقة الصنع' (prefabricated houses) or 'وحدات سكنية مسبقة الصنع' is more common and understood. Let's refine accordingly.",
        "final": "نحن بحاجة إلى باحثين ذوي خبرة في الهندسة الإنشائية المقاومة للزلازل لتصميم وحدات سكنية مسبقة الصنع (تركيبية).",
        "confidence": 9.7
    }
}

def translate_en_to_ar(text: str) -> dict:
    """
    Agent 10 - Translation Agent:
    Translates English text to Arabic using an agentic critique-and-refine workflow.
    Ensures high accuracy, grammatical precision, and natural phrasing.
    """
    text_stripped = text.strip()
    text_lower = text_stripped.lower().rstrip(".")
    
    # Check if we have a predefined demo translation to return immediately (high-fidelity demo)
    for key, value in DEMO_TRANSLATIONS.items():
        if key in text_lower or text_lower in key:
            return {
                "original_text": text_stripped,
                "initial_translation": value["initial"],
                "critique": value["critique"],
                "final_translation": value["final"],
                "confidence_score": value["confidence"],
                "is_fallback": True
            }

    # Fallback response structure if API key is missing
    fallback_response = {
        "original_text": text_stripped,
        "initial_translation": f"[ترجمة مبدئية تجريبية] {text_stripped}",
        "critique": "Offline Demo Mode: Simulated translation critique. No Gemini API key detected in backend configuration. Please add a valid GEMINI_API_KEY in the backend .env file.",
        "final_translation": f"[ترجمة نهائية] {text_stripped} (الرجاء تهيئة مفتاح API للترجمة الدقيقة)",
        "confidence_score": 5.0,
        "is_fallback": True
    }

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        logger.warning("Gemini unavailable. Returning offline fallback translation.")
        return fallback_response

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # --- PHASE 1: Initial Translation ---
        prompt_1 = (
            "You are a professional translator. Translate the following English text into clear, "
            "grammatically correct Modern Standard Arabic (Fusha). Do not add explanations, notes, or markup. "
            "Just output the Arabic translation.\n\n"
            f"English text:\n\"{text_stripped}\"\n\n"
            "Arabic Translation:"
        )
        
        res_1 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_1
        )
        initial_translation = res_1.text.strip()
        
        # --- PHASE 2: Critique and Reflection ---
        prompt_2 = (
            "You are an expert Arabic linguist and editor. Critique this English-to-Arabic translation.\n\n"
            f"Original English:\n\"{text_stripped}\"\n\n"
            f"Draft Arabic Translation:\n\"{initial_translation}\"\n\n"
            "Evaluate this draft translation and provide constructive critique in English. Focus on:\n"
            "1. Grammatical correctness and spelling.\n"
            "2. Word choice and professional terminology, particularly in academic, civil engineering, or NGO sectors.\n"
            "3. Natural phrasing, style, and flow in Modern Standard Arabic.\n"
            "4. Ensuring no details are lost or falsely added.\n\n"
            "Outline specific problems (if any) and suggest improvements. Keep your critique concise (around 3-4 sentences)."
        )
        
        res_2 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_2
        )
        critique = res_2.text.strip()
        
        # --- PHASE 3: Refined Translation & Scoring ---
        prompt_3 = (
            f"You are the CollabBridge Translation Agent. Your task is to produce a highly accurate, polished final Arabic translation.\n\n"
            f"Original English:\n\"{text_stripped}\"\n\n"
            f"Initial Arabic Draft:\n\"{initial_translation}\"\n\n"
            f"Critique / Suggestions:\n\"{critique}\"\n\n"
            "Please revise the initial translation based on the critique. Make sure the output is natural, fluent, "
            "and professional. "
            "Provide also a confidence score (from 0.0 to 10.0) reflecting the accuracy and flow of this translation.\n\n"
            "Respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"final_translation\": \"Polished Arabic text...\",\n"
            "  \"confidence_score\": 9.5\n"
            "}\n"
            "Do not wrap in markdown code blocks. Ensure the output is valid JSON."
        )
        
        res_3 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_3,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result_json = json.loads(res_3.text)
        
        return {
            "original_text": text_stripped,
            "initial_translation": initial_translation,
            "critique": critique,
            "final_translation": result_json.get("final_translation", initial_translation),
            "confidence_score": float(result_json.get("confidence_score", 9.0)),
            "is_fallback": False
        }
        
    except Exception as e:
        logger.error(f"Error in translation agent pipeline: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        return {
            "original_text": text_stripped,
            "initial_translation": f"[Error during translation] {text_stripped}",
            "critique": f"Exception encountered: {str(e)}",
            "final_translation": f"[Error] {text_stripped}",
            "confidence_score": 0.0,
            "is_fallback": True
        }

PREDEFINED_TRANSLATIONS = {
    # English to Arabic
    "Mohamad Hallak": "محمد حلاق",
    "Osmania University": "جامعة عثمانية",
    "India": "الهند",
    "Syrian": "سوري",
    "Statistics": "قسم الإحصاء",
    "Ph.D. Researcher": "باحث دكتوراه",
    "Computer vision, Handwriting Recognition, Object Detection, Image Segmentation and Image Processing.": "الرؤية الحاسوبية، والتعرف على خط اليد، والكشف عن الكائنات، وتقسيم الصور، ومعالجة الصور الرقمية.",
    "Computer Vision": "الرؤية الحاسوبية",
    "Handwriting Recognition": "التعرف على الكتابة اليدوية",
    "Python": "بايثون",
    "OpenCV": "أوبن سي في",
    "MLOps": "عمليات تعلم الآلة (MLOps)",
    "DVC": "أداة التحكم بالبيانات (DVC)",
    "Pytroch": "باي تورش (PyTorch)",
    "TensorFlow": "تنسور فلو",
    "Vibe Coding": "برمجة الفايب",
    "English": "الإنجليزية",
    "Arabic": "العربية",
    "40 hours/week": "40 ساعة/أسبوع",
    "Large": "كبير",
    "Medium": "متوسط",
    "Small": "صغير",
    
    "Grading Automation": "أتمتة تصحيح الامتحانات",
    "Aleppo University": "جامعة حلب",
    "Aleppo": "حلب",
    "Education": "التعليم",
    "High": "عالية",
    "Automating the correction of exams' answers sheets will save huge time of the researcher which can be utilized for advancing the research and concentrating on more important tasks.": "إن أتمتة تصحيح أوراق إجابات الامتحانات سيوفر وقتاً كبيراً للباحثين، مما يتيح استغلاله في تطوير الأبحاث العلمية والتركيز على المهام الأكثر أهمية.",
    "Image Processing": "معالجة الصور",
    "Data Versioning": "إصدار البيانات",
    "Code Versioning": "إصدار الأكواد",
    "12 Months": "12 شهراً",
    "Anonymous Owner": "جهة غير معلنة",
}

REVERSE_TRANSLATIONS = {v: k for k, v in PREDEFINED_TRANSLATIONS.items()}

def fallback_translate_text(text: str, target_lang: str) -> str:
    if not text:
        return text
    
    # Try exact match in dict
    lookup = PREDEFINED_TRANSLATIONS if target_lang == "ar" else REVERSE_TRANSLATIONS
    if text in lookup:
        return lookup[text]
    
    # Try case-insensitive exact match
    text_stripped = text.strip()
    for k, v in lookup.items():
        if k.lower() == text_stripped.lower():
            return v
            
    # Word-by-word/phrase-by-phrase fallback translation for custom text
    words_map = {
        "damascus": "دمشق", "homs": "حمص", "hama": "حماة", "lattakia": "اللاذقية", "tartous": "طرطوس",
        "daraa": "درعا", "idlib": "إدلب", "raqqa": "الرقة", "deir ez-or": "دير الزور",
        "infrastructure": "البنية التحتية", "water": "المياه", "energy": "الطاقة", "agriculture": "الزراعة",
        "health": "الصحة", "reconstruction": "إعادة الإعمار", "syria": "سوريا", "researcher": "باحث",
        "expert": "خبير", "project": "مشروع", "development": "التنمية", "sustainable": "المستدامة"
    }
    if target_lang == "en":
        # reverse words map
        words_map = {v: k.capitalize() for k, v in words_map.items()}
        
    words = text_stripped.split()
    translated_words = []
    for w in words:
        w_clean = w.strip(",.()\"'").lower()
        if w_clean in words_map:
            translated_words.append(words_map[w_clean])
        else:
            translated_words.append(w)
            
    return " ".join(translated_words)

def translate_entity_dict(entity_type: str, data: dict, target_lang: str) -> dict:
    """
    Translates all text fields of a Researcher or Project dictionary into the target language.
    Utilizes Gemini for high-fidelity translation, with professional dictionary fallbacks.
    """
    # Extract fields to translate
    fields_to_translate = {}
    if entity_type == "project":
        fields_to_translate = {
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "organization": data.get("organization", ""),
            "location": data.get("location", ""),
            "sector": data.get("sector", ""),
            "priority": data.get("priority", "")
        }
    else: # researcher
        fields_to_translate = {
            "name": data.get("name", ""),
            "institution": data.get("institution", ""),
            "country": data.get("country", ""),
            "position": data.get("position", ""),
            "department": data.get("department", ""),
            "expertise": data.get("expertise", "")
        }

    if not settings.GEMINI_API_KEY or not settings.GEMINI_AVAILABLE:
        translated_fields = {}
        for k, v in fields_to_translate.items():
            if isinstance(v, list):
                translated_fields[k] = [fallback_translate_text(item, target_lang) for item in v]
            elif isinstance(v, str):
                translated_fields[k] = fallback_translate_text(v, target_lang)
            else:
                translated_fields[k] = v

        translated = data.copy()
        translated["lang"] = target_lang
        for k, v in translated_fields.items():
            translated[k] = v
        translated["_translation_unavailable"] = True
        return translated

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        lang_name = "Modern Standard Arabic (Fusha)" if target_lang == "ar" else "English"
        
        # --- PHASE 1: Initial Translation ---
        prompt_1 = (
            f"You are a professional translator. Translate all the string values inside this JSON object "
            f"from English/Arabic to {lang_name}. Do not translate the keys, only the values. "
            f"Maintain identical keys in the resulting JSON.\n\n"
            f"JSON object:\n{json.dumps(fields_to_translate, ensure_ascii=False)}\n\n"
            f"Respond ONLY with the translated JSON object. Do not add markdown code block tags."
        )
        
        res_1 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_1,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        initial_translation_json = json.loads(res_1.text)
        
        # --- PHASE 2: Critique and Reflection ---
        prompt_2 = (
            f"You are an expert bilingual linguist specializing in English-{lang_name} translations. "
            f"Compare the original JSON object with the draft translated JSON object.\n\n"
            f"Original JSON:\n{json.dumps(fields_to_translate, ensure_ascii=False)}\n\n"
            f"Draft Translated JSON:\n{json.dumps(initial_translation_json, ensure_ascii=False)}\n\n"
            f"Provide a brief critique in English of the translation. Evaluate:\n"
            f"1. Natural flow and professional vocabulary in {lang_name}.\n"
            f"2. Precise technical and academic term mapping (e.g. Syrian cities like Damascus/دمشق, Homs/حمص, water filtration/تصفية المياه).\n"
            f"3. Style alignment (e.g. academic or reconstruction NGO tone).\n\n"
            f"Highlight any specific words that should be changed to improve precision."
        )
        
        res_2 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_2
        )
        critique = res_2.text.strip()
        
        # --- PHASE 3: Refined Translation ---
        prompt_3 = (
            f"You are the CollabBridge Translation Agent. Your task is to produce a highly accurate, polished final translation "
            f"in {lang_name} based on the critique.\n\n"
            f"Original JSON:\n{json.dumps(fields_to_translate, ensure_ascii=False)}\n\n"
            f"Draft Translated JSON:\n{json.dumps(initial_translation_json, ensure_ascii=False)}\n\n"
            f"Linguistic Critique:\n{critique}\n\n"
            f"Please revise the string values inside the draft JSON to incorporate all critique suggestions. "
            f"Keep the keys unchanged.\n\n"
            f"Respond ONLY with the final translated JSON object. Do not wrap in markdown code blocks."
        )
        
        res_3 = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt_3,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        translated_fields = json.loads(res_3.text)
        
        translated = data.copy()
        translated["lang"] = target_lang
        for k, v in translated_fields.items():
            translated[k] = v

        return translated
    except Exception as e:
        logger.error(f"Error translating entity {entity_type}: {e}. Disabling Gemini for this session.")
        settings.GEMINI_AVAILABLE = False
        # Run local fallback dictionary translator
        translated_fields = {}
        for k, v in fields_to_translate.items():
            if isinstance(v, list):
                translated_fields[k] = [fallback_translate_text(item, target_lang) for item in v]
            elif isinstance(v, str):
                translated_fields[k] = fallback_translate_text(v, target_lang)
            else:
                translated_fields[k] = v

        translated = data.copy()
        translated["lang"] = target_lang
        for k, v in translated_fields.items():
            translated[k] = v

        translated["_translation_error"] = str(e)
        translated["_translation_unavailable"] = True
        return translated
