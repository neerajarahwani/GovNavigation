const mongoose = require('mongoose');

// An admin-posted update notice. relatedTaskId null = shown everywhere (global);
// set = shown only on that task's roadmap. isActive is how an old one is
// retired — never deleted outright.
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    relatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

announcementSchema.index({ relatedTaskId: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
