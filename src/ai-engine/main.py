"""
LahoreLens NLP Microservice
===========================
Provides real-time sentiment analysis, topic classification, and
AI-powered place insights from 21,000+ analyzed social media comments.
"""

import os
import re
import logging
from collections import Counter
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

# Curated Lahore landmarks with metadata
LANDMARKS = [
    {"id": "badshahi-mosque", "name": "Badshahi Mosque", "keywords": ["badshahi", "mosque"], "category": "Historical", "description": "One of the largest mosques in the world, built by Mughal Emperor Aurangzeb in 1673.", "visitDuration": "1-2 hours"},
    {"id": "lahore-fort", "name": "Lahore Fort (Shahi Qila)", "keywords": ["lahore fort", "shahi qila", "qila"], "category": "Historical", "description": "A UNESCO World Heritage Site featuring Mughal-era architecture.", "visitDuration": "2-3 hours"},
    {"id": "shalimar-gardens", "name": "Shalimar Gardens", "keywords": ["shalimar", "shalimar gardens"], "category": "Historical", "description": "A UNESCO World Heritage Site built by Shah Jahan in 1641.", "visitDuration": "1-2 hours"},
    {"id": "minar-e-pakistan", "name": "Minar-e-Pakistan", "keywords": ["minar", "minar-e-pakistan", "minar e pakistan"], "category": "Monument", "description": "National monument marking the site of the 1940 Lahore Resolution.", "visitDuration": "1 hour"},
    {"id": "food-street", "name": "Fort Road Food Street", "keywords": ["food street", "fort road"], "category": "Food & Dining", "description": "Famous food street near Badshahi Mosque with traditional Lahori cuisine.", "visitDuration": "2-3 hours"},
    {"id": "anarkali", "name": "Anarkali Bazaar", "keywords": ["anarkali"], "category": "Shopping", "description": "One of the oldest bazaars in South Asia, famous for traditional shopping.", "visitDuration": "2-3 hours"},
    {"id": "heera-mandi", "name": "Heera Mandi", "keywords": ["heera mandi", "hira mandi"], "category": "Cultural", "description": "Historic area near the Walled City, known for its cultural heritage.", "visitDuration": "1-2 hours"},
    {"id": "liberty-market", "name": "Liberty Market", "keywords": ["liberty"], "category": "Shopping", "description": "Popular commercial area in the heart of Lahore.", "visitDuration": "2-3 hours"},
    {"id": "gulberg", "name": "Gulberg", "keywords": ["gulberg", "mm alam"], "category": "Lifestyle", "description": "Upscale neighborhood known for cafes, restaurants, and nightlife.", "visitDuration": "Half day"},
    {"id": "dha", "name": "DHA Lahore", "keywords": ["dha"], "category": "Lifestyle", "description": "Modern residential and commercial area with parks and restaurants.", "visitDuration": "Half day"},
    {"id": "johar-town", "name": "Johar Town", "keywords": ["johar town", "johar"], "category": "Residential", "description": "Popular residential area with local food spots and parks.", "visitDuration": "2-3 hours"},
    {"id": "data-darbar", "name": "Data Darbar", "keywords": ["data darbar", "data sahab"], "category": "Religious", "description": "The largest Sufi shrine in South Asia, a spiritual landmark of Lahore.", "visitDuration": "1-2 hours"},
    {"id": "mall-road", "name": "Mall Road", "keywords": ["mall road"], "category": "Historical", "description": "Historic boulevard with colonial-era buildings, museums, and landmarks.", "visitDuration": "2-3 hours"},
    {"id": "walled-city", "name": "Walled City of Lahore", "keywords": ["walled city", "androon lahore", "old lahore", "old city"], "category": "Historical", "description": "The ancient heart of Lahore with centuries of Mughal and Sikh heritage.", "visitDuration": "3-4 hours"},
]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- App Setup ---
app = FastAPI(
    title="LahoreLens NLP API",
    description="Sentiment Analysis & Topic Modeling for Lahore travel data",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory data ---
lda_model = None
vectorizer = None
hf_pipeline = None
comments_df = None  # Full dataset loaded in memory


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
    words = set(text.lower().split())
    if words & FOOD_KEYWORDS:
        return {"topicId": 2, "topicName": "Food & Dining"}
    social_keywords = {'people', 'life', 'love', 'feel', 'think', 'know', 'friend'}
    if words & social_keywords:
        return {"topicId": 0, "topicName": "Social/Personal"}
    return {"topicId": 1, "topicName": "General/Lifestyle"}


def get_topic_lda(text: str) -> dict:
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
        logger.warning(f"LDA prediction failed: {e}")
        return get_topic_keywords(text)


def find_comments_for_place(place_keywords: list, limit: int = 200) -> pd.DataFrame:
    """Find all comments mentioning a place by its keywords."""
    global comments_df
    if comments_df is None:
        return pd.DataFrame()

    pattern = '|'.join(re.escape(kw) for kw in place_keywords)
    mask = comments_df['comment'].str.contains(pattern, case=False, na=False)
    return comments_df[mask].head(limit)


def generate_place_summary(place_name: str, matched: pd.DataFrame) -> str:
    """Use sentiment analysis to generate a natural language summary."""
    total = len(matched)
    if total == 0:
        return f"We don't have enough data about {place_name} yet."

    moods = matched['mood'].value_counts()
    pos = moods.get('Positive', 0)
    neg = moods.get('Negative', 0)
    neu = moods.get('Neutral', 0)
    pos_pct = round(pos / total * 100)

    topics = matched['topic_name'].value_counts()
    top_topic = topics.index[0] if len(topics) > 0 else "General"

    # Extract meaningful words from comments
    all_text = ' '.join(matched['comment'].dropna().astype(str).tolist())
    words = re.findall(r'\b[a-zA-Z]{4,}\b', all_text.lower())
    stop = {'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'your',
            'will', 'would', 'could', 'should', 'about', 'which', 'when', 'what', 'there',
            'here', 'just', 'also', 'very', 'more', 'like', 'some', 'than', 'then', 'only',
            'true', 'https', 'reddit', 'points', 'point', 'lahore', 'pakistan', 'comment',
            'really', 'much', 'most', 'many', 'make', 'made', 'know', 'even', 'well', 'good',
            'best', 'dont', 'does', 'other', 'place', 'still', 'come', 'going', 'want', 'need',
            'every', 'time', 'city', 'people'}
    word_freq = Counter(w for w in words if w not in stop and w not in [k.lower() for k in [place_name]])
    top_words = [w for w, _ in word_freq.most_common(8)]

    # Build summary
    lines = []

    if pos_pct >= 70:
        lines.append(f"Our AI analyzed **{total} social media posts** about {place_name} and found an overwhelmingly positive sentiment — **{pos_pct}%** of visitors loved their experience!")
    elif pos_pct >= 50:
        lines.append(f"Based on **{total} analyzed posts**, {place_name} has a generally positive reputation — **{pos_pct}%** of comments express a positive sentiment.")
    else:
        lines.append(f"From **{total} analyzed posts**, {place_name} has mixed reviews — **{pos_pct}%** positive, **{round(neg/total*100)}%** negative.")

    if top_words:
        lines.append(f"People frequently mention: **{', '.join(top_words[:5])}**.")

    lines.append(f"The dominant discussion topic is **{top_topic}**.")

    if neg > 5:
        neg_comments = matched[matched['mood'] == 'Negative']['comment'].dropna().tolist()[:3]
        if neg_comments:
            lines.append(f"Some visitors expressed concerns — {neg} negative posts were identified.")

    return ' '.join(lines)


def get_top_comments(matched: pd.DataFrame, mood: str = None, n: int = 5) -> list:
    """Get the most relevant comments, optionally filtered by mood."""
    if mood:
        filtered = matched[matched['mood'] == mood]
    else:
        filtered = matched

    # Prefer longer, more meaningful comments
    filtered = filtered.copy()
    filtered['_len'] = filtered['comment'].astype(str).str.len()
    filtered = filtered[filtered['_len'] > 30].sort_values('_len', ascending=False)

    results = []
    for _, row in filtered.head(n).iterrows():
        comment_text = str(row.get('comment', ''))
        # Clean up tab-separated data in comment
        parts = comment_text.split('\t')
        clean_comment = parts[0] if len(parts) == 1 else (parts[3] if len(parts) >= 4 else parts[0])
        if len(clean_comment) > 20:
            results.append({
                "text": clean_comment[:300],
                "mood": row.get('mood', 'Neutral'),
                "topicName": row.get('topic_name', 'General'),
            })
    return results


# --- Pydantic Models ---
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

class LandmarkSummary(BaseModel):
    id: str
    name: str
    category: str
    description: str
    visitDuration: str
    mentionCount: int
    positivePercent: int
    dominantMood: str
    topTopic: str

class PlaceInsight(BaseModel):
    id: str
    name: str
    category: str
    description: str
    visitDuration: str
    mentionCount: int
    sentimentBreakdown: dict
    aiSummary: str
    topKeywords: list
    topPositiveComments: list
    topNegativeComments: list
    topicDistribution: list


# --- Startup ---
@app.on_event("startup")
async def startup():
    global lda_model, vectorizer, comments_df

    # Load CSV into memory
    if os.path.exists(CSV_PATH):
        logger.info("Loading comment dataset into memory...")
        comments_df = pd.read_csv(CSV_PATH)
        logger.info(f"Loaded {len(comments_df)} comments.")
    else:
        logger.warning(f"CSV not found at {CSV_PATH}")

    # Load or train LDA
    if os.path.exists(LDA_MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        logger.info("Loading pre-trained LDA model...")
        lda_model = joblib.load(LDA_MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        logger.info("LDA model loaded.")
    elif comments_df is not None:
        logger.info("Training LDA model from CSV...")
        try:
            comments = comments_df['comment'].dropna().astype(str).tolist()
            vectorizer = CountVectorizer(max_df=0.9, min_df=5, stop_words='english')
            tf = vectorizer.fit_transform(comments)
            lda_model = LatentDirichletAllocation(n_components=3, random_state=42)
            lda_model.fit(tf)
            joblib.dump(lda_model, LDA_MODEL_PATH)
            joblib.dump(vectorizer, VECTORIZER_PATH)
            logger.info(f"LDA trained on {len(comments)} comments.")
        except Exception as e:
            logger.error(f"LDA training failed: {e}")


# --- Endpoints ---

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "lda_loaded": lda_model is not None,
        "hf_loaded": hf_pipeline is not None,
        "records_available": len(comments_df) if comments_df is not None else 0,
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze a single comment."""
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
    """Analyze multiple comments."""
    if len(request.comments) > 100:
        raise HTTPException(status_code=400, detail="Max 100 comments per batch")
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


@app.get("/landmarks", response_model=List[LandmarkSummary])
async def get_landmarks():
    """Get all curated landmarks with live mention counts and sentiment."""
    results = []
    for lm in LANDMARKS:
        matched = find_comments_for_place(lm["keywords"])
        total = len(matched)
        moods = matched['mood'].value_counts() if total > 0 else {}
        pos = moods.get('Positive', 0)
        topics = matched['topic_name'].value_counts() if total > 0 else {}

        results.append({
            "id": lm["id"],
            "name": lm["name"],
            "category": lm["category"],
            "description": lm["description"],
            "visitDuration": lm["visitDuration"],
            "mentionCount": total,
            "positivePercent": round(pos / total * 100) if total > 0 else 0,
            "dominantMood": moods.index[0] if len(moods) > 0 else "Neutral",
            "topTopic": topics.index[0] if len(topics) > 0 else "General",
        })

    # Sort by mention count descending
    results.sort(key=lambda x: x["mentionCount"], reverse=True)
    return results


@app.get("/insights/{place_id}", response_model=PlaceInsight)
async def get_place_insights(place_id: str):
    """Get AI-generated insights for a specific landmark."""
    landmark = next((lm for lm in LANDMARKS if lm["id"] == place_id), None)
    if not landmark:
        raise HTTPException(status_code=404, detail="Landmark not found")

    matched = find_comments_for_place(landmark["keywords"], limit=500)
    total = len(matched)

    if total == 0:
        return {
            "id": landmark["id"],
            "name": landmark["name"],
            "category": landmark["category"],
            "description": landmark["description"],
            "visitDuration": landmark["visitDuration"],
            "mentionCount": 0,
            "sentimentBreakdown": {"Positive": 0, "Negative": 0, "Neutral": 0},
            "aiSummary": f"We don't have enough data about {landmark['name']} yet.",
            "topKeywords": [],
            "topPositiveComments": [],
            "topNegativeComments": [],
            "topicDistribution": [],
        }

    moods = matched['mood'].value_counts().to_dict()
    topics = matched['topic_name'].value_counts()

    # Extract keywords
    all_text = ' '.join(matched['comment'].dropna().astype(str).tolist())
    words = re.findall(r'\b[a-zA-Z]{4,}\b', all_text.lower())
    stop = {'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'your',
            'will', 'would', 'could', 'should', 'about', 'which', 'when', 'what', 'there',
            'here', 'just', 'also', 'very', 'more', 'like', 'some', 'than', 'then', 'only',
            'true', 'https', 'reddit', 'points', 'point', 'lahore', 'pakistan', 'comment',
            'really', 'much', 'most', 'many', 'make', 'made', 'know', 'even', 'well', 'good',
            'best', 'dont', 'does', 'other', 'place', 'still', 'come', 'going', 'want', 'need',
            'every', 'time', 'city', 'people'}
    word_freq = Counter(w for w in words if w not in stop)
    top_kw = [w for w, _ in word_freq.most_common(10)]

    return {
        "id": landmark["id"],
        "name": landmark["name"],
        "category": landmark["category"],
        "description": landmark["description"],
        "visitDuration": landmark["visitDuration"],
        "mentionCount": total,
        "sentimentBreakdown": {
            "Positive": moods.get("Positive", 0),
            "Negative": moods.get("Negative", 0),
            "Neutral": moods.get("Neutral", 0),
        },
        "aiSummary": generate_place_summary(landmark["name"], matched),
        "topKeywords": top_kw,
        "topPositiveComments": get_top_comments(matched, mood="Positive", n=5),
        "topNegativeComments": get_top_comments(matched, mood="Negative", n=3),
        "topicDistribution": [{"topic": t, "count": int(c)} for t, c in topics.items()],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

