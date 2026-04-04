"""
LahoreLens NLP Microservice
===========================
A FastAPI service that provides real-time sentiment analysis and topic classification
for Lahore-related social media comments.

Uses:
- TextBlob for lightweight sentiment analysis
- Scikit-learn LDA for topic classification
- (Optional) Fine-tuned XLM-RoBERTa for multilingual sentiment (if model files present)
"""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import pandas as pd
import joblib

# --- Configuration ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'lahorelens_final_model', 'lahorelens_final_ai')
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'ai_models', 'LAHORE_LENS_MASTER_API_READY.csv')
LDA_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'lda_model.joblib')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'vectorizer.joblib')

TOPIC_MAP = {0: 'Social/Personal', 1: 'General/Lifestyle', 2: 'Food & Dining'}
FOOD_KEYWORDS = {'food', 'best', 'good', 'restaurant', 'visit', 'eat', 'biryani', 'karahi', 'nihari', 'chai', 'lassi', 'halwa', 'puri', 'naan', 'tikka', 'kebab', 'meal', 'dinner', 'lunch', 'breakfast', 'cafe', 'dhaba', 'dine', 'taste', 'delicious', 'yummy'}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- App Setup ---
app = FastAPI(
    title="LahoreLens NLP API",
    description="Sentiment Analysis & Topic Modeling for Lahore travel data",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models (loaded at startup) ---
lda_model = None
vectorizer = None
hf_pipeline = None


def get_mood_textblob(text: str) -> dict:
    """Lightweight sentiment using TextBlob."""
    analysis = TextBlob(str(text))
    polarity = analysis.sentiment.polarity
    if polarity > 0.05:
        mood = "Positive"
    elif polarity < -0.05:
        mood = "Negative"
    else:
        mood = "Neutral"
    return {"mood": mood, "confidence": round(abs(polarity), 3)}


def get_topic_keywords(text: str) -> dict:
    """Classify topic using keyword matching (fast fallback)."""
    words = set(text.lower().split())
    if words & FOOD_KEYWORDS:
        return {"topicId": 2, "topicName": "Food & Dining"}
    # Simple heuristic for social/personal
    social_keywords = {'people', 'life', 'love', 'feel', 'think', 'know', 'friend'}
    if words & social_keywords:
        return {"topicId": 0, "topicName": "Social/Personal"}
    return {"topicId": 1, "topicName": "General/Lifestyle"}


def get_topic_lda(text: str) -> dict:
    """Classify topic using the trained LDA model."""
    global lda_model, vectorizer
    if lda_model is None or vectorizer is None:
        return get_topic_keywords(text)
    try:
        tf = vectorizer.transform([text])
        topic_dist = lda_model.transform(tf)
        topic_id = topic_dist.argmax(axis=1)[0]
        return {
            "topicId": int(topic_id),
            "topicName": TOPIC_MAP.get(topic_id, "General/Lifestyle"),
        }
    except Exception as e:
        logger.warning(f"LDA prediction failed, using keyword fallback: {e}")
        return get_topic_keywords(text)


# --- Request/Response Models ---
class AnalyzeRequest(BaseModel):
    comment: str


class AnalyzeResponse(BaseModel):
    comment: str
    mood: str
    confidence: float
    topicId: int
    topicName: str


class BatchAnalyzeRequest(BaseModel):
    comments: List[str]


class HealthResponse(BaseModel):
    status: str
    lda_loaded: bool
    hf_loaded: bool
    records_available: int


# --- Startup: Train/Load LDA ---
@app.on_event("startup")
async def startup():
    global lda_model, vectorizer

    # Try to load pre-saved LDA model
    if os.path.exists(LDA_MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        logger.info("Loading pre-trained LDA model...")
        lda_model = joblib.load(LDA_MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        logger.info("LDA model loaded successfully.")
        return

    # Otherwise, train from CSV
    if os.path.exists(CSV_PATH):
        logger.info("Training LDA model from CSV...")
        try:
            df = pd.read_csv(CSV_PATH)
            # Clean comments
            comments = df['comment'].dropna().astype(str).tolist()

            vectorizer = CountVectorizer(max_df=0.9, min_df=5, stop_words='english')
            tf = vectorizer.fit_transform(comments)

            lda_model = LatentDirichletAllocation(n_components=3, random_state=42)
            lda_model.fit(tf)

            # Save for next time
            joblib.dump(lda_model, LDA_MODEL_PATH)
            joblib.dump(vectorizer, VECTORIZER_PATH)
            logger.info(f"LDA model trained on {len(comments)} comments and saved.")
        except Exception as e:
            logger.error(f"Failed to train LDA: {e}")
    else:
        logger.warning(f"CSV not found at {CSV_PATH}. Using keyword-only topic classification.")


# --- Endpoints ---
@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    record_count = 0
    if os.path.exists(CSV_PATH):
        try:
            record_count = sum(1 for _ in open(CSV_PATH)) - 1
        except Exception:
            pass

    return {
        "status": "healthy",
        "lda_loaded": lda_model is not None,
        "hf_loaded": hf_pipeline is not None,
        "records_available": record_count,
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze a single comment for sentiment and topic."""
    if not request.comment or len(request.comment.strip()) < 2:
        raise HTTPException(status_code=400, detail="Comment too short")

    sentiment = get_mood_textblob(request.comment)
    topic = get_topic_lda(request.comment)

    return {
        "comment": request.comment,
        "mood": sentiment["mood"],
        "confidence": sentiment["confidence"],
        "topicId": topic["topicId"],
        "topicName": topic["topicName"],
    }


@app.post("/batch-analyze", response_model=List[AnalyzeResponse])
async def batch_analyze(request: BatchAnalyzeRequest):
    """Analyze multiple comments at once."""
    if len(request.comments) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 comments per batch")

    results = []
    for comment in request.comments:
        if not comment or len(comment.strip()) < 2:
            continue
        sentiment = get_mood_textblob(comment)
        topic = get_topic_lda(comment)
        results.append({
            "comment": comment,
            "mood": sentiment["mood"],
            "confidence": sentiment["confidence"],
            "topicId": topic["topicId"],
            "topicName": topic["topicName"],
        })

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
