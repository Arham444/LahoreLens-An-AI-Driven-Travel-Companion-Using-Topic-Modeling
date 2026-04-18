const Place = require('../models/Place');

// @desc    Get trending recommendations (with optional topic/mood filters)
// @route   GET /api/places/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
    try {
        const { topic, mood, limit = 20, page = 1 } = req.query;
        const query = {};

        if (topic) query.topicName = topic;
        if (mood) query.mood = mood;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const recommendations = await Place.find(query)
            .sort({ sentimentScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Place.countDocuments(query);

        res.json({
            data: recommendations,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Recommendations Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search places by text
// @route   GET /api/places/search
// @access  Public
const searchPlaces = async (req, res) => {
    const { q, topic, mood } = req.query;

    try {
        if (!q) return res.json([]);

        const query = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { comment: { $regex: q, $options: 'i' } },
            ],
        };

        if (topic) query.topicName = topic;
        if (mood) query.mood = mood;

        const results = await Place.find(query).limit(50);
        res.json(results);
    } catch (error) {
        console.error('Search Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get topic distribution stats
// @route   GET /api/places/stats
// @access  Public
const getStats = async (req, res) => {
    try {
        const topicStats = await Place.aggregate([
            { $group: { _id: '$topicName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const moodStats = await Place.aggregate([
            { $group: { _id: '$mood', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const sourceStats = await Place.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({ topics: topicStats, moods: moodStats, sources: sourceStats });
    } catch (error) {
        console.error('Stats Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getRecommendations,
    searchPlaces,
    getStats,
};

