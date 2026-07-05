import math
import logging
from typing import List
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

# Global flag to bypass the Gemini API once it fails/times out, avoiding sequential hangs.
_use_mock_fallback = False

def _generate_mock_embedding(text: str) -> List[float]:
    """
    Generates a deterministic mock vector based on text hash for testing.
    """
    h = hash(text)
    return [math.sin(h + i) * 0.05 for i in range(768)]

def get_embedding(text: str) -> List[float]:
    """
    Generates a vector embedding for the input text using Gemini's text-embedding-004 model.
    If no GEMINI_API_KEY is configured or the API is failing, returns a mock vector.
    """
    global _use_mock_fallback
    if _use_mock_fallback or not settings.GEMINI_API_KEY:
        return _generate_mock_embedding(text)

    try:
        # Initialize client with a short timeout to prevent hanging indefinitely
        client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=10000) # 10 seconds timeout
        )
        response = client.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=text
        )
        if response and response.embeddings:
            return response.embeddings[0].values
        else:
            raise ValueError("No embeddings returned in response")
    except Exception as e:
        logger.error(f"Error generating embedding via Gemini API: {e}. Switching to mock fallback.")
        _use_mock_fallback = True
        return _generate_mock_embedding(text)

def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings for a list of input texts in a batch.
    """
    if not texts:
        return []
        
    global _use_mock_fallback
    if _use_mock_fallback or not settings.GEMINI_API_KEY:
        return [_generate_mock_embedding(t) for t in texts]
        
    try:
        client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=10000) # 10 seconds timeout
        )
        response = client.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=texts
        )
        if response and response.embeddings:
            return [emb.values for emb in response.embeddings]
        else:
            raise ValueError("No embeddings returned in response")
    except Exception as e:
        logger.error(f"Error generating batch embeddings via Gemini API: {e}. Switching to mock fallback.")
        _use_mock_fallback = True
        # Instantly generate mock embeddings for the whole batch
        return [_generate_mock_embedding(t) for t in texts]


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """
    Computes the cosine similarity between two vectors.
    """
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
        
    return dot_product / (norm_a * norm_b)
