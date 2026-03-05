const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');

// All Firebase logins and signups hit this route to sync with MongoDB
router.post('/sync', syncUser);

module.exports = router;
