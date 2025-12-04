const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    sentimentScore: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Place', placeSchema);
