const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY not set. Gemini features will be unavailable.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// In-memory cache for place guides (avoid re-calling Gemini for same place)
const placeGuideCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ─── SYSTEM PROMPTS ───

const CHAT_SYSTEM_PROMPT = `You are LahoreLens AI — a friendly, knowledgeable travel assistant for Lahore, Pakistan.

Your knowledge:
- You know Lahore's history (Mughal, Sikh, British, modern eras)
- You're an expert on Lahore's food scene (nihari, paya, biryani, lassi, etc.)
- You know all major landmarks, neighborhoods, markets, and restaurants
- You can suggest itineraries (1-day, 3-day, week-long trips)
- You understand safety tips, best times to visit, local customs

Rules:
- Be warm, conversational, and enthusiastic about Lahore
- Give specific place names and practical tips
- If asked about something outside Lahore/Pakistan travel, politely redirect
- Keep responses concise but informative (2-3 paragraphs max)
- Use emojis sparingly for warmth 🕌🍗✨`;

const PLACE_GUIDE_PROMPT = (placeName, category, description, nlpSummary) => `
You are a Lahore travel expert writing a comprehensive guide for "${placeName}" (Category: ${category}).
Current description: ${description}

Our AI analyzed social media data and found: ${nlpSummary}

Generate a JSON response with this EXACT structure:
{
  "history": "2-3 paragraphs about the place's history, cultural significance, and what makes it special. Write engagingly but factually.",
  "attractions": [
    {"name": "Attraction 1", "description": "1-2 sentences about this specific thing to see/do"},
    {"name": "Attraction 2", "description": "1-2 sentences"},
    {"name": "Attraction 3", "description": "1-2 sentences"},
    {"name": "Attraction 4", "description": "1-2 sentences"}
  ],
  "tips": [
    "Practical tip 1 for visitors",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "bestTimeToVisit": "When to visit and why",
  "nearbyPlaces": ["Place 1", "Place 2", "Place 3"]
}

IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text.`;

// ─── HELPERS ───

async function getNlpSummaryForPlace(placeId) {
    try {
        const res = await axios.get(`${AI_SERVICE_URL}/insights/${placeId}`, { timeout: 10000 });
        const data = res.data;
        return `${data.mentionCount} social media mentions found. ${data.sentimentBreakdown?.Positive || 0} positive, ${data.sentimentBreakdown?.Negative || 0} negative, ${data.sentimentBreakdown?.Neutral || 0} neutral. Top keywords: ${(data.topKeywords || []).slice(0, 5).join(', ')}.`;
    } catch (err) {
        return 'No NLP data available yet.';
    }
}

async function getLandmarkInfo(placeId) {
    try {
        const res = await axios.get(`${AI_SERVICE_URL}/insights/${placeId}`, { timeout: 10000 });
        return res.data;
    } catch (err) {
        return null;
    }
}

// ─── ENDPOINTS ───

// POST /api/gemini/chat
const chatWithGemini = async (req, res) => {
    if (!genAI) {
        return res.status(503).json({ message: 'Gemini API key not configured' });
    }

    const { message, history = [] } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'You are LahoreLens AI travel assistant. Acknowledge.' }] },
                { role: 'model', parts: [{ text: CHAT_SYSTEM_PROMPT }] },
                ...history.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        res.json({ reply: response });
    } catch (error) {
        console.error('Gemini Chat Error:', error.message);
        if (error.message?.includes('API_KEY_INVALID')) {
            return res.status(401).json({ message: 'Invalid Gemini API key' });
        }
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return res.status(429).json({ message: 'AI is busy, please wait a moment and try again.' });
        }
        res.status(500).json({ message: 'Failed to get AI response', error: error.message });
    }
};

// GET /api/gemini/place/:id
const getPlaceGuide = async (req, res) => {
    if (!genAI) {
        return res.status(503).json({ message: 'Gemini API key not configured' });
    }

    const placeId = req.params.id;

    // Check cache
    const cached = placeGuideCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
    }

    try {
        // Get NLP data from our Python service
        const nlpData = await getLandmarkInfo(placeId);
        if (!nlpData) {
            return res.status(404).json({ message: 'Place not found' });
        }

        const nlpSummary = `${nlpData.mentionCount} social media mentions. ${nlpData.sentimentBreakdown?.Positive || 0} positive, ${nlpData.sentimentBreakdown?.Negative || 0} negative. Top keywords: ${(nlpData.topKeywords || []).slice(0, 5).join(', ')}.`;

        const prompt = PLACE_GUIDE_PROMPT(nlpData.name, nlpData.category, nlpData.description, nlpSummary);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON from response (handle possible markdown fences)
        let guide;
        try {
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            guide = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error('Failed to parse Gemini JSON:', text.substring(0, 200));
            return res.status(500).json({ message: 'Failed to parse AI response' });
        }

        const responseData = {
            placeId,
            name: nlpData.name,
            ...guide,
            generatedAt: new Date().toISOString(),
        };

        // Cache it
        placeGuideCache.set(placeId, { data: responseData, timestamp: Date.now() });

        res.json(responseData);
    } catch (error) {
        console.error('Gemini Place Guide Error:', error.message);
        res.status(500).json({ message: 'Failed to generate place guide', error: error.message });
    }
};

module.exports = { chatWithGemini, getPlaceGuide };
