const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite } = require('../controllers/userController');
const { protect } = require('../middleware/auth.middleware');

// Routes for user favorites
router.route('/favorites')
    .post(protect, addFavorite);

router.route('/favorites/:placeId')
    .delete(protect, removeFavorite);

module.exports = router;
