const express = require('express');
const { listActive } = require('../controllers/announcementsController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Public — no login needed, same reasoning as the tasks endpoints.
router.get('/', asyncHandler(listActive));

module.exports = router;
