const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');
const { validateAuthSync } = require('../middleware/validation.middleware');

// All Firebase logins and signups hit this route to sync with MongoDB
router.post('/sync', validateAuthSync, syncUser);

module.exports = router;
