const express = require('express');
const { create, update, listAll } = require('../controllers/announcementsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', authenticate, authorize('admin'), asyncHandler(create));
router.patch('/:id', authenticate, authorize('admin'), asyncHandler(update));
router.get('/', authenticate, authorize('admin'), asyncHandler(listAll));

module.exports = router;
