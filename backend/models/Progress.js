const mongoose = require('mongoose');

// One document per (user, task) pair — which steps that user has finished.
const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    completedSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
    // "Save Roadmap" — a bookmark independent of step completion. A user can
    // bookmark a task without ever marking a step done.
    bookmarked: { type: Boolean, default: false },
    // Document names (matching Step.documents entries) the user has said
    // they already own, persisted per task so it survives a page refresh.
    ownedDocuments: [{ type: String }],
  },
  { timestamps: true }
);

// A user can only ever have one progress document per task.
progressSchema.index({ userId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
