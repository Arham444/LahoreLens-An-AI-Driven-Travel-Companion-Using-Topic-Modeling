const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Analyze a comment for sentiment and topic
// @route   POST /api/analyze
// @access  Public
const analyzeComment = async (req, res) => {
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    try {
        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            comment: comment,
        });
        res.json(response.data);
    } catch (error) {
        console.error('AI Service Error:', error.message);

        // If the Python service is down, fall back to a basic response
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI analysis service is currently unavailable',
                fallback: true,
            });
        }
        res.status(500).json({ message: 'Failed to analyze comment' });
    }
};

// @desc    Batch analyze multiple comments
// @route   POST /api/analyze/batch
// @access  Public
const batchAnalyze = async (req, res) => {
    const { comments } = req.body;

    if (!comments || !Array.isArray(comments)) {
        return res.status(400).json({ message: 'Array of comments is required' });
    }

    try {
        const response = await axios.post(`${AI_SERVICE_URL}/batch-analyze`, {
            comments: comments,
        });
        res.json(response.data);
    } catch (error) {
        console.error('AI Batch Analysis Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI analysis service is currently unavailable',
                fallback: true,
            });
        }
        res.status(500).json({ message: 'Failed to analyze comments' });
    }
};

module.exports = { analyzeComment, batchAnalyze };
