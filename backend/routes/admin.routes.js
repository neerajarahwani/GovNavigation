const express = require('express');
const {
  listTasks,
  getTask,
  updateTask,
  updateStep,
  verifyStep,
  verifyForm,
} = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Every route here requires a real admin account — no citizen access at all.
router.get('/tasks', authenticate, authorize('admin'), asyncHandler(listTasks));
router.get('/tasks/:taskId', authenticate, authorize('admin'), asyncHandler(getTask));
router.patch('/tasks/:taskId', authenticate, authorize('admin'), asyncHandler(updateTask));
router.patch('/steps/:stepId', authenticate, authorize('admin'), asyncHandler(updateStep));
router.post('/steps/:stepId/verify', authenticate, authorize('admin'), asyncHandler(verifyStep));
router.post(
  '/tasks/:taskId/forms/:formId/verify',
  authenticate,
  authorize('admin'),
  asyncHandler(verifyForm)
);

module.exports = router;
