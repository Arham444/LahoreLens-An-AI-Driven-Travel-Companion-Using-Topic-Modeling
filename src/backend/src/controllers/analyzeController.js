const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiProxy = async (method, path, data, res) => {
    try {
        const config = { method, url: `${AI_SERVICE_URL}${path}` };
        if (data) config.data = data;
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        console.error(`AI Service Error [${path}]:`, error.message);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: 'AI analysis service is currently unavailable', fallback: true });
        }
        if (error.response?.status === 404) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(500).json({ message: 'AI service error' });
    }
};

// POST /api/analyze
const analyzeComment = async (req, res) => {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: 'Comment text is required' });
    await aiProxy('post', '/analyze', { comment }, res);
};

// POST /api/analyze/batch
const batchAnalyze = async (req, res) => {
    const { comments } = req.body;
    if (!comments || !Array.isArray(comments)) return res.status(400).json({ message: 'Array of comments is required' });
    await aiProxy('post', '/batch-analyze', { comments }, res);
};

// GET /api/analyze/landmarks
const getLandmarks = async (req, res) => {
    await aiProxy('get', '/landmarks', null, res);
};

// GET /api/analyze/landmarks/:id/insights
const getPlaceInsights = async (req, res) => {
    await aiProxy('get', `/insights/${req.params.id}`, null, res);
};

module.exports = { analyzeComment, batchAnalyze, getLandmarks, getPlaceInsights };

