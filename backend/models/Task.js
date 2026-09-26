const mongoose = require('mongoose');

// A civic task, e.g. "Register a small business" — holds its ordered list of steps.
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    city: { type: String, required: true },
    keywords: [{ type: String }],
    steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
  },
  { timestamps: true }
);

taskSchema.index({ keywords: 1 });
taskSchema.index({ city: 1 });

module.exports = mongoose.model('Task', taskSchema);
