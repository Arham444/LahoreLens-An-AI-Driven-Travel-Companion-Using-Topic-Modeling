const express = require('express');
const router = express.Router();
const { analyzeComment, batchAnalyze, getLandmarks, getPlaceInsights } = require('../controllers/analyzeController');

router.post('/', analyzeComment);
router.post('/batch', batchAnalyze);
router.get('/landmarks', getLandmarks);
router.get('/landmarks/:id/insights', getPlaceInsights);

module.exports = router;
