const express = require('express');
const rateLimit = require('express-rate-limit');
const { query, fetchById } = require('../controllers/tasksController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Every call here spends some of the daily Gemini quota, so this route is limited
// on top of the general per-IP limit — protects the demo from one burst of clicks
// (accidental or not) using up the whole day's quota.
const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please wait a moment and try again.' },
});

router.post('/query', queryLimiter, asyncHandler(query));
router.get('/:taskId', asyncHandler(fetchById));

module.exports = router;
