const { body, validationResult } = require('express-validator');

// Validation rules for the /api/auth/sync route
const validateAuthSync = [
    body('token')
        .exists()
        .withMessage('Firebase authentication token is required')
        .isString()
        .withMessage('Token must be a valid string')
        .notEmpty()
        .withMessage('Token cannot be empty'),

    // Middleware to catch the errors and return them
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Data Validation Failed',
                errors: errors.array() 
            });
        }
        next();
    }
];

module.exports = {
    validateAuthSync
};
