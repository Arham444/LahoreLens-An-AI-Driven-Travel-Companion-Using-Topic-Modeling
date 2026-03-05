const admin = require('../config/firebase');
const User = require('../models/User');

// @desc    Register or Login a user via Firebase
// @route   POST /api/auth/sync
// @access  Public
const syncUser = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        // 1. Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name } = decodedToken;

        // 2. Check if user already exists in our MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            // 3. If new user, create them in MongoDB
            user = await User.create({
                username: name || email.split('@')[0], // Fallback username if none provided
                email: email,
                password: uid, // We no longer need local passwords, use UID as placeholder or remove password requirement from model
            });
            console.log("New user registered via Firebase:", email);
        } else {
            console.log("Existing user logged in via Firebase:", email);
        }

        // 4. Return user data (The frontend will use the Firebase token for future requests, not a local JWT)
        res.status(200).json({
            _id: user.id,
            username: user.username,
            email: user.email,
        });

    } catch (error) {
        console.error("Firebase Auth Error:", error.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    syncUser,
};
