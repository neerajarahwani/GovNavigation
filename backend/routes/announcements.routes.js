const express = require('express');
const { listActive, markRead } = require('../controllers/announcementsController');
const asyncHandler = require('../middleware/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authenticateOptional = require('../middleware/authenticateOptional');

const router = express.Router();

// Public — no login needed, same reasoning as the tasks endpoints. Personalizes
// isRead when a valid token is sent, but still works for anonymous callers.
router.get('/', authenticateOptional, asyncHandler(listActive));

// Logged-in only — marks announcements read for the current user.
router.post('/read', authenticate, asyncHandler(markRead));

module.exports = router;
