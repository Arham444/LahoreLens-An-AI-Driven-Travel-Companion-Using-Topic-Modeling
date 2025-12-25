const Place = require('../models/Place');

// @desc    Get trending recommendations
// @route   GET /api/places/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
    try {
        // Return top 5 places sorted by sentiment
        const recommendations = await Place.find({}).sort({ sentimentScore: -1 }).limit(5);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search places
// @route   GET /api/places/search
// @access  Public
const searchPlaces = async (req, res) => {
    const { q } = req.query;

    try {
        if (!q) return res.json([]);

        const results = await Place.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
            ],
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getRecommendations,
    searchPlaces,
};
