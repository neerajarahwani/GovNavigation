const mongoose = require('mongoose');

// One stage inside a task. sourceUrl/lastVerified are required so no step can be
// saved without a real, traceable source — this is the project's trust guarantee.
const stepSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    // Each document a citizen needs, tagged by category (e.g. "Identity Proof")
    // so the frontend can group them in the Documents checklist.
    documents: [
      {
        name: { type: String, required: true },
        tag: { type: String, default: '' },
      },
    ],
    fees: { type: String },
    estimatedDays: { type: Number },
    eligibility: { type: String },
    prerequisites: [{ type: String }],
    description: { type: String },
    keyPoints: [{ type: String }],
    govtTag: { type: String },
    sourceTitle: { type: String },
    subtitle: { type: String },
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
    canRunParallelWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Step' }],
    sourceUrl: { type: String, required: true },
    lastVerified: { type: Date, required: true },
    confidenceScore: { type: Number, min: 0, max: 1, default: 1 },
  },
  { timestamps: true }
);

stepSchema.index({ taskId: 1 });

module.exports = mongoose.model('Step', stepSchema);
