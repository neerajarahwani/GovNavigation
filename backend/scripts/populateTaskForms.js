// One-off: populates Task.forms for tasks that already have a step sourced
// from a real downloadable government application form (a PDF), reusing that
// same sourceUrl rather than scraping anything new — per the data-integrity
// rule, a fact derived from an already-sourced step should reference that
// source, not create a fresh unsourced one.
// Run manually: node backend/scripts/populateTaskForms.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

// Step name -> real application-form PDF, hand-reviewed (not every PDF a step
// links to is an application form itself — e.g. an instruction manual isn't).
const FORM_STEP_NAMES = [
  'Documents Required: Proof of Residence', // Form 6 — Voter ID
  "Documents Required: Learner's License", // Form 2 — Driving License
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const steps = await Step.find({ name: { $in: FORM_STEP_NAMES } });
  const seenPerTask = new Set();

  for (const step of steps) {
    const key = `${step.taskId}:${step.sourceUrl}`;
    if (seenPerTask.has(key)) continue;
    seenPerTask.add(key);

    const task = await Task.findById(step.taskId);
    if (!task) continue;

    const alreadyHasForm = task.forms.some((f) => f.sourceUrl === step.sourceUrl);
    if (alreadyHasForm) {
      console.log(`"${task.title}" already has a form for this source — skipping.`);
      continue;
    }

    task.forms.push({
      title: step.sourceTitle || step.name,
      department: step.department,
      link: step.sourceUrl,
      sourceUrl: step.sourceUrl,
      lastVerified: step.lastVerified,
      confidenceScore: step.confidenceScore,
    });
    await task.save();
    console.log(`Added form "${step.sourceTitle || step.name}" to task "${task.title}".`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Populate failed:', err.message);
  process.exit(1);
});
