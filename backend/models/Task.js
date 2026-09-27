const mongoose = require('mongoose');

// A civic task, e.g. "Register a small business" — holds its ordered list of steps.
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    city: { type: String, required: true },
    keywords: [{ type: String }],
    steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
    // Official application forms for this task as a whole (e.g. Form 6 for
    // voter registration). Same data-integrity rule as Step: every form must
    // carry a real source and a verification date.
    forms: [
      {
        title: { type: String, required: true },
        department: { type: String },
        link: { type: String, required: true },
        sourceUrl: { type: String, required: true },
        lastVerified: { type: Date, required: true },
        confidenceScore: { type: Number, min: 0, max: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

taskSchema.index({ keywords: 1 });
taskSchema.index({ city: 1 });

module.exports = mongoose.model('Task', taskSchema);
