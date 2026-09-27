const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const EDITABLE_TASK_FIELDS = ['title', 'city', 'keywords', 'forms'];
const EDITABLE_STEP_FIELDS = [
  'name',
  'department',
  'documents',
  'fees',
  'estimatedDays',
  'eligibility',
  'prerequisites',
  'sourceUrl',
  'dependsOn',
  'canRunParallelWith',
  'description',
  'keyPoints',
  'govtTag',
  'sourceTitle',
  'subtitle',
];

// Builds an update object containing only the allowed fields that were actually
// sent — never spreads req.body directly into a Mongoose update.
function pickFields(body, allowedFields) {
  const update = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      update[field] = body[field];
    }
  }
  return update;
}

// GET /api/admin/tasks — every task, with a count of steps still unverified.
// Uses a single aggregate query instead of counting per task in a loop.
async function listTasks(req, res) {
  const tasks = await Task.find({});

  const unverifiedCounts = await Step.aggregate([
    { $match: { confidenceScore: { $lt: 1 } } },
    { $group: { _id: '$taskId', count: { $sum: 1 } } },
  ]);
  const unverifiedByTaskId = new Map(unverifiedCounts.map((row) => [String(row._id), row.count]));

  const data = tasks.map((task) => ({
    taskId: task._id,
    title: task.title,
    city: task.city,
    totalSteps: task.steps.length,
    unverifiedSteps: unverifiedByTaskId.get(String(task._id)) || 0,
  }));

  return res.status(200).json({ success: true, data });
}

// GET /api/admin/tasks/:taskId — full detail for editing.
async function getTask(req, res) {
  const { taskId } = req.params;
  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  const steps = await Step.find({ taskId: task._id });
  return res.status(200).json({ success: true, data: { task, steps } });
}

// PATCH /api/admin/tasks/:taskId
async function updateTask(req, res) {
  const { taskId } = req.params;
  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  const update = pickFields(req.body || {}, EDITABLE_TASK_FIELDS);

  // Same data-integrity rule as steps — a form can never end up without a
  // real source.
  if (Object.prototype.hasOwnProperty.call(update, 'forms')) {
    const allValid = (update.forms || []).every(
      (f) =>
        f &&
        typeof f === 'object' &&
        typeof f.title === 'string' &&
        f.title.trim() &&
        typeof f.link === 'string' &&
        f.link.trim() &&
        typeof f.sourceUrl === 'string' &&
        f.sourceUrl.trim()
    );
    if (!allValid) {
      return res.status(400).json({
        success: false,
        error: 'Each form must have a title, link, and sourceUrl.',
      });
    }
    update.forms = update.forms.map((f) => ({ ...f, lastVerified: f.lastVerified || new Date() }));
  }

  const task = await Task.findByIdAndUpdate(taskId, update, { new: true, runValidators: true });
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  return res.status(200).json({ success: true, data: task });
}

// PATCH /api/admin/steps/:stepId
async function updateStep(req, res) {
  const { stepId } = req.params;
  if (!mongoose.isValidObjectId(stepId)) {
    return res.status(404).json({ success: false, error: 'Step not found.' });
  }

  const update = pickFields(req.body || {}, EDITABLE_STEP_FIELDS);

  // The data-integrity rule applies to edits too — a step can never end up
  // without a real source.
  if (Object.prototype.hasOwnProperty.call(update, 'sourceUrl') && !update.sourceUrl) {
    return res.status(400).json({ success: false, error: 'sourceUrl cannot be empty.' });
  }

  // Validate any id lists explicitly, so a bad id gives a clean 400 instead of
  // an uncaught cast error turning into a generic 500.
  for (const field of ['dependsOn', 'canRunParallelWith']) {
    if (Object.prototype.hasOwnProperty.call(update, field)) {
      const allValid = (update[field] || []).every((id) => mongoose.isValidObjectId(id));
      if (!allValid) {
        return res.status(400).json({ success: false, error: `${field} must be a list of valid ids.` });
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(update, 'documents')) {
    const allValid = (update.documents || []).every(
      (d) => d && typeof d === 'object' && typeof d.name === 'string' && d.name.trim()
    );
    if (!allValid) {
      return res.status(400).json({
        success: false,
        error: 'documents must be a list of { name, tag } objects with a non-empty name.',
      });
    }
  }

  const step = await Step.findByIdAndUpdate(stepId, update, { new: true, runValidators: true });
  if (!step) {
    return res.status(404).json({ success: false, error: 'Step not found.' });
  }

  return res.status(200).json({ success: true, data: step });
}

// POST /api/admin/steps/:stepId/verify — marks a step as personally checked.
async function verifyStep(req, res) {
  const { stepId } = req.params;
  if (!mongoose.isValidObjectId(stepId)) {
    return res.status(404).json({ success: false, error: 'Step not found.' });
  }

  const step = await Step.findByIdAndUpdate(
    stepId,
    { confidenceScore: 1, lastVerified: new Date() },
    { new: true, runValidators: true }
  );
  if (!step) {
    return res.status(404).json({ success: false, error: 'Step not found.' });
  }

  return res.status(200).json({ success: true, data: step });
}

// POST /api/admin/tasks/:taskId/forms/:formId/verify — marks one of a task's
// forms as personally checked, same pattern as verifyStep.
async function verifyForm(req, res) {
  const { taskId, formId } = req.params;
  if (!mongoose.isValidObjectId(taskId) || !mongoose.isValidObjectId(formId)) {
    return res.status(404).json({ success: false, error: 'Task or form not found.' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  const form = task.forms.id(formId);
  if (!form) {
    return res.status(404).json({ success: false, error: 'Form not found.' });
  }

  form.confidenceScore = 1;
  form.lastVerified = new Date();
  await task.save();

  return res.status(200).json({ success: true, data: task });
}

module.exports = { listTasks, getTask, updateTask, updateStep, verifyStep, verifyForm };
