const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Task = require('../models/Task');

// POST /api/progress — marks one step done or not-done for a task, scoped to the
// logged-in user only. req.user.id always comes from the verified JWT, never from
// the request body — there is no way for a client to act on someone else's account.
async function markStep(req, res) {
  const { taskId, stepId, completed } = req.body || {};

  if (!mongoose.isValidObjectId(taskId) || !mongoose.isValidObjectId(stepId)) {
    return res.status(400).json({ success: false, error: 'A valid taskId and stepId are required.' });
  }
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ success: false, error: 'completed must be true or false.' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  let progress = await Progress.findOne({ userId: req.user.id, taskId });
  if (!progress) {
    progress = await Progress.create({ userId: req.user.id, taskId, completedSteps: [] });
  }

  const stepIdStr = String(stepId);
  const alreadyHasStep = progress.completedSteps.some((id) => String(id) === stepIdStr);

  if (completed && !alreadyHasStep) {
    progress.completedSteps.push(stepId);
  } else if (!completed && alreadyHasStep) {
    progress.completedSteps = progress.completedSteps.filter((id) => String(id) !== stepIdStr);
  }
  await progress.save();

  return res.status(200).json({
    success: true,
    data: { taskId: progress.taskId, completedSteps: progress.completedSteps },
  });
}

// GET /api/progress/:taskId — returns the logged-in user's saved progress for one
// task. No saved progress yet isn't an error — it just means "not started."
async function getTaskProgress(req, res) {
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({ success: false, error: 'A valid taskId is required.' });
  }

  const progress = await Progress.findOne({ userId: req.user.id, taskId });

  return res.status(200).json({
    success: true,
    data: {
      taskId,
      completedSteps: progress ? progress.completedSteps : [],
      bookmarked: progress ? progress.bookmarked : false,
      ownedDocuments: progress ? progress.ownedDocuments : [],
    },
  });
}

// POST /api/progress/bookmark — "Save Roadmap": bookmarks a task independent of
// step completion. A user can bookmark a task without ever marking a step done.
async function setBookmark(req, res) {
  const { taskId, bookmarked } = req.body || {};

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({ success: false, error: 'A valid taskId is required.' });
  }
  if (typeof bookmarked !== 'boolean') {
    return res.status(400).json({ success: false, error: 'bookmarked must be true or false.' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  let progress = await Progress.findOne({ userId: req.user.id, taskId });
  if (!progress) {
    progress = await Progress.create({ userId: req.user.id, taskId, completedSteps: [] });
  }

  progress.bookmarked = bookmarked;
  await progress.save();

  return res.status(200).json({
    success: true,
    data: { taskId: progress.taskId, bookmarked: progress.bookmarked },
  });
}

// POST /api/progress/documents — marks one document (by name, matching a
// Step.documents entry) as owned or not-owned for a task, so the Documents
// checklist survives a page refresh.
async function setDocumentOwned(req, res) {
  const { taskId, documentName, owned } = req.body || {};

  if (!mongoose.isValidObjectId(taskId)) {
    return res.status(400).json({ success: false, error: 'A valid taskId is required.' });
  }
  if (!documentName || typeof documentName !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid documentName is required.' });
  }
  if (typeof owned !== 'boolean') {
    return res.status(400).json({ success: false, error: 'owned must be true or false.' });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  let progress = await Progress.findOne({ userId: req.user.id, taskId });
  if (!progress) {
    progress = await Progress.create({ userId: req.user.id, taskId, completedSteps: [] });
  }

  const alreadyOwned = progress.ownedDocuments.includes(documentName);
  if (owned && !alreadyOwned) {
    progress.ownedDocuments.push(documentName);
  } else if (!owned && alreadyOwned) {
    progress.ownedDocuments = progress.ownedDocuments.filter((d) => d !== documentName);
  }
  await progress.save();

  return res.status(200).json({
    success: true,
    data: { taskId: progress.taskId, ownedDocuments: progress.ownedDocuments },
  });
}

// GET /api/progress — lists every task the logged-in user has any saved progress
// on, with the task's title/city and completion counts. Fetches all the relevant
// tasks in one batched query instead of one query per progress row.
async function listProgress(req, res) {
  const progressEntries = await Progress.find({ userId: req.user.id });

  const taskIds = progressEntries.map((p) => p.taskId);
  const tasks = await Task.find({ _id: { $in: taskIds } });
  const taskById = new Map(tasks.map((t) => [String(t._id), t]));

  const data = progressEntries
    .map((p) => {
      const task = taskById.get(String(p.taskId));
      if (!task) return null; // task was deleted after progress was saved — skip it
      return {
        taskId: task._id,
        title: task.title,
        city: task.city,
        completedCount: p.completedSteps.length,
        totalSteps: task.steps.length,
        bookmarked: p.bookmarked,
      };
    })
    .filter(Boolean);

  return res.status(200).json({ success: true, data });
}

module.exports = { markStep, getTaskProgress, listProgress, setBookmark, setDocumentOwned };
