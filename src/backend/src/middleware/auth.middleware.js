const admin = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Get user from our database using the Firebase UID or email
            // We use email as the primary link between Firebase and our MongoDB
            req.user = await User.findOne({ email: decodedToken.email }).select('-password');

            if (!req.user) {
                // If user exists in Firebase but not in our DB, we can optionally create them here
                // For now, we reject if they aren't synced.
                return res.status(401).json({ message: 'User not found in local database' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
