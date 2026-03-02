const User = require('../models/User');
const Place = require('../models/Place');

// @desc    Add a place to favorites
// @route   POST /api/users/favorites
// @access  Private
const addFavorite = async (req, res) => {
    const { placeId } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if place exists
        const place = await Place.findById(placeId);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }

        // Avoid duplicates
        if (user.favorites.includes(placeId)) {
            return res.status(400).json({ message: 'Place is already in favorites' });
        }

        user.favorites.push(placeId);
        await user.save();

        res.status(200).json({ message: 'Place added to favorites', favorites: user.favorites });
    } catch (error) {
        console.error("Add Favorite Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove a place from favorites
// @route   DELETE /api/users/favorites/:placeId
// @access  Private
const removeFavorite = async (req, res) => {
    const { placeId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites.filter((id) => id.toString() !== placeId);
        await user.save();

        res.status(200).json({ message: 'Place removed from favorites', favorites: user.favorites });
    } catch (error) {
        console.error("Remove Favorite Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addFavorite,
    removeFavorite
};
