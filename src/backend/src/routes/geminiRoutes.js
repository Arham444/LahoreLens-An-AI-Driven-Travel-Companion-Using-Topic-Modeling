const express = require('express');
const router = express.Router();
const { chatWithGemini, getPlaceGuide } = require('../controllers/geminiController');

router.post('/chat', chatWithGemini);
router.get('/place/:id', getPlaceGuide);

module.exports = router;
