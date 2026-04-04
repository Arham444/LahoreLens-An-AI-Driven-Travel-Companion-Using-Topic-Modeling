const express = require('express');
const router = express.Router();
const { analyzeComment, batchAnalyze } = require('../controllers/analyzeController');

router.post('/', analyzeComment);
router.post('/batch', batchAnalyze);

module.exports = router;
