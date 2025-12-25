const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Keeping flexible for now (e.g., "March 15, 2025")
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
