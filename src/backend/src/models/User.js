const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false, // Handled by Firebase
    },
    searchHistory: [{
        type: String,
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
