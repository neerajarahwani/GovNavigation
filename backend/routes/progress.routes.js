const express = require('express');
const { markStep, getTaskProgress, listProgress } = require('../controllers/progressController');
const authenticate = require('../middleware/authenticate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Every route here requires a real logged-in user — no anonymous access.
router.post('/', authenticate, asyncHandler(markStep));
router.get('/', authenticate, asyncHandler(listProgress));
router.get('/:taskId', authenticate, asyncHandler(getTaskProgress));

module.exports = router;
