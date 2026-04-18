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
    // --- NLP Fields (from trained model) ---
    mood: {
        type: String,
        enum: ['Positive', 'Negative', 'Neutral'],
        default: 'Neutral',
    },
    topicId: {
        type: Number,
        default: 0,
    },
    topicName: {
        type: String,
        enum: ['Social/Personal', 'General/Lifestyle', 'Food & Dining'],
        default: 'General/Lifestyle',
    },
    // --- Source metadata (parsed from CSV) ---
    source: {
        type: String, // e.g. "Reddit", "YouTube"
    },
    sourceUrl: {
        type: String,
    },
    originalUser: {
        type: String,
    },
    likes: {
        type: String,
    },
    comment: {
        type: String,
    },
}, {
    timestamps: true,
});

// Text index for search
placeSchema.index({ name: 'text', comment: 'text', description: 'text' });

module.exports = mongoose.model('Place', placeSchema);

