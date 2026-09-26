// Adds one new step to the existing "Register a small business" task so the
// parallel-layout feature has a real case to demonstrate — deliberately
// additive, never touches or recreates existing tasks/steps (see
// .claude/docs/dependency-maps/roadmap-parallel-layout.md for why not just
// re-running the main seed script). Safe to run more than once — checks for an
// existing step with the same name first.
// Run manually: node backend/scripts/addParallelExampleStep.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const NEW_STEP_NAME = 'Register for Professional Tax';
const PLACEHOLDER_SOURCE = 'PLACEHOLDER - not yet sourced';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const task = await Task.findOne({ title: 'Register a small business' });
  if (!task) {
    console.error('Task "Register a small business" not found — nothing to do.');
    process.exit(1);
  }

  const existing = await Step.findOne({ taskId: task._id, name: NEW_STEP_NAME });
  if (existing) {
    console.log('Step already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const licenseStep = await Step.findOne({ taskId: task._id, name: 'Get a Shop and Establishment License' });
  const gstStep = await Step.findOne({ taskId: task._id, name: 'Apply for GST Registration' });

  if (!licenseStep || !gstStep) {
    console.error('Expected existing steps not found — aborting without changes.');
    process.exit(1);
  }

  const newStep = await Step.create({
    taskId: task._id,
    name: NEW_STEP_NAME,
    department: 'State Tax Department',
    documents: ['PAN card', 'business address proof'],
    fees: '₹200 (example)',
    estimatedDays: 4,
    eligibility: 'Any business with employees or turnover above the professional tax threshold',
    prerequisites: ['Get a Shop and Establishment License'],
    dependsOn: [licenseStep._id],
    canRunParallelWith: [gstStep._id],
    sourceUrl: PLACEHOLDER_SOURCE,
    lastVerified: new Date(),
    confidenceScore: 0,
  });

  // The pairing is mutual — the existing GST step should point back too.
  gstStep.canRunParallelWith = [...(gstStep.canRunParallelWith || []), newStep._id];
  await gstStep.save();

  task.steps = [...task.steps, newStep._id];
  await task.save();

  console.log(`Added "${NEW_STEP_NAME}" to "${task.title}", parallel with "Apply for GST Registration".`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to add parallel example step:', err.message);
  process.exit(1);
});
