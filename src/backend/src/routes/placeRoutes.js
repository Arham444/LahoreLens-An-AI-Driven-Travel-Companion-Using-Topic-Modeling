const express = require('express');
const router = express.Router();
const { getRecommendations, searchPlaces, getStats } = require('../controllers/placeController');

router.get('/recommendations', getRecommendations);
router.get('/search', searchPlaces);
router.get('/stats', getStats);

module.exports = router;

