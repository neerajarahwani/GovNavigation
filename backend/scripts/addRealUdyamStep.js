// Adds the project's first genuinely real, government-sourced task+step —
// extracted by scrapeAndExtract.js from the real Udyam Registration page
// (udyamregistration.gov.in), reviewed by hand, then added here with a real
// sourceUrl and confidenceScore: 1. Kept as its own separate task rather than
// folded into the fictional "Register a small business" task, so real,
// verified content never gets mixed in with placeholder data under the same
// task. Idempotent — safe to run more than once.
// Run manually: node backend/scripts/addRealUdyamStep.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const TASK_TITLE = 'Register as an MSME (Udyam Registration)';
const REAL_SOURCE_URL = 'https://www.udyamregistration.gov.in/Important.aspx';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  let task = await Task.findOne({ title: TASK_TITLE });
  if (task) {
    console.log('Task already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  task = await Task.create({
    title: TASK_TITLE,
    city: 'All India',
    keywords: ['msme', 'udyam', 'business registration', 'small business', 'startup'],
    steps: [],
  });

  // Exactly what scrapeAndExtract.js returned from the real page, reviewed by
  // hand — documents/estimatedDays are left empty/null because the real page
  // genuinely doesn't specify them (the process is explicitly documentless),
  // not because anything was skipped.
  const step = await Step.create({
    taskId: task._id,
    name: 'Udyam Registration',
    department: 'Ministry of Micro, Small and Medium Enterprises',
    documents: [],
    fees: 'No fee',
    estimatedDays: null,
    eligibility: 'Any person who intends to establish a micro, small or medium enterprise',
    prerequisites: ['Aadhaar number', 'GSTIN and PAN (as applicable)'],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: REAL_SOURCE_URL,
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  task.steps = [step._id];
  await task.save();

  console.log(`Added real task "${TASK_TITLE}" with a verified step, sourced from ${REAL_SOURCE_URL}.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to add the real Udyam step:', err.message);
  process.exit(1);
});
