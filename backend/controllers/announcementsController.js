const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Task = require('../models/Task');
const User = require('../models/User');

const EDITABLE_FIELDS = ['title', 'body', 'relatedTaskId', 'isActive'];

function pickFields(body, allowedFields) {
  const update = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      update[field] = body[field];
    }
  }
  return update;
}

// If relatedTaskId is present and not null, it must point to a real task.
async function validateRelatedTaskId(relatedTaskId) {
  if (relatedTaskId === undefined || relatedTaskId === null) return null;
  if (!mongoose.isValidObjectId(relatedTaskId)) return 'relatedTaskId is not a valid id.';
  const task = await Task.findById(relatedTaskId);
  if (!task) return 'relatedTaskId does not match a real task.';
  return null;
}

// POST /api/admin/announcements
async function create(req, res) {
  const { title, body, relatedTaskId } = req.body || {};

  if (!title || typeof title !== 'string' || !body || typeof body !== 'string') {
    return res.status(400).json({ success: false, error: 'title and body are required.' });
  }

  const relatedError = await validateRelatedTaskId(relatedTaskId);
  if (relatedError) {
    return res.status(relatedError.includes('valid id') ? 400 : 404).json({ success: false, error: relatedError });
  }

  const announcement = await Announcement.create({
    title,
    body,
    relatedTaskId: relatedTaskId || null,
  });

  return res.status(201).json({ success: true, data: announcement });
}

// PATCH /api/admin/announcements/:id
async function update(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ success: false, error: 'Announcement not found.' });
  }

  const fields = pickFields(req.body || {}, EDITABLE_FIELDS);

  if (Object.prototype.hasOwnProperty.call(fields, 'relatedTaskId')) {
    const relatedError = await validateRelatedTaskId(fields.relatedTaskId);
    if (relatedError) {
      return res.status(relatedError.includes('valid id') ? 400 : 404).json({ success: false, error: relatedError });
    }
  }

  const announcement = await Announcement.findByIdAndUpdate(id, fields, {
    new: true,
    runValidators: true,
  });
  if (!announcement) {
    return res.status(404).json({ success: false, error: 'Announcement not found.' });
  }

  return res.status(200).json({ success: true, data: announcement });
}

// GET /api/admin/announcements
async function listAll(req, res) {
  const announcements = await Announcement.find({}).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: announcements });
}

// GET /api/announcements?taskId=... — public, but personalizes isRead when
// called with a valid token (see authenticateOptional).
async function listActive(req, res) {
  const { taskId } = req.query;
  const hasValidTaskId = taskId && mongoose.isValidObjectId(taskId);

  const filter = hasValidTaskId
    ? { isActive: true, $or: [{ relatedTaskId: null }, { relatedTaskId: taskId }] }
    : { isActive: true, relatedTaskId: null };

  const announcements = await Announcement.find(filter).sort({ createdAt: -1 });

  let readIdSet = new Set();
  if (req.user) {
    const user = await User.findById(req.user.id).select('readAnnouncementIds');
    if (user) readIdSet = new Set(user.readAnnouncementIds.map((id) => id.toString()));
  }

  const data = announcements.map((a) => ({ ...a.toObject(), isRead: readIdSet.has(a._id.toString()) }));
  return res.status(200).json({ success: true, data });
}

// POST /api/announcements/read — body: { ids: string[] }
// Marks the given announcements as read for the logged-in user, so they stop
// counting toward that user's unread badge on every future login/visit.
async function markRead(req, res) {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
  if (validIds.length === 0) {
    return res.status(400).json({ success: false, error: 'No valid announcement ids provided.' });
  }

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { readAnnouncementIds: { $each: validIds } } });
  return res.status(200).json({ success: true });
}

module.exports = { create, update, listAll, listActive, markRead };
