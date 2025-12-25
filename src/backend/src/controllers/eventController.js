const Event = require('../models/Event');

// @desc    Get all upcoming events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        // For now, return all events. In future, filter by date.
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getEvents,
};
