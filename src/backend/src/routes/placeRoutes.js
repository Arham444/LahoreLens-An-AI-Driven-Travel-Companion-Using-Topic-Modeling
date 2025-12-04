const express = require('express');
const router = express.Router();
const { getRecommendations, searchPlaces } = require('../controllers/placeController');

router.get('/recommendations', getRecommendations);
router.get('/search', searchPlaces);

module.exports = router;
