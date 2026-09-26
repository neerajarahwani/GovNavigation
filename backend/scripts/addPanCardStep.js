// Adds an "Apply for a PAN Card" step to the existing "Register a small
// business" task, and wires it as a dependency of the two existing steps that
// already require "PAN card" as a document — this is what the
// document-shortcuts feature demonstrates (skip this step if the citizen
// already has a PAN card). Additive only, same reasoning as
// addParallelExampleStep.js — never recreates existing task/step ids.
// Run manually: node backend/scripts/addPanCardStep.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const NEW_STEP_NAME = 'Apply for a PAN Card';
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

  const gstStep = await Step.findOne({ taskId: task._id, name: 'Apply for GST Registration' });
  const profTaxStep = await Step.findOne({ taskId: task._id, name: 'Register for Professional Tax' });

  if (!gstStep || !profTaxStep) {
    console.error('Expected existing steps not found — aborting without changes.');
    process.exit(1);
  }

  const newStep = await Step.create({
    taskId: task._id,
    name: NEW_STEP_NAME,
    department: 'Income Tax Department',
    documents: ['ID proof', 'address proof'],
    fees: '₹110 (example)',
    estimatedDays: 10,
    eligibility: 'Any individual or business entity without an existing PAN',
    prerequisites: [],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: PLACEHOLDER_SOURCE,
    lastVerified: new Date(),
    confidenceScore: 0,
  });

  // Both existing steps already need a PAN card as a document — make that a
  // real dependency, additive (keeps whatever they already depended on).
  gstStep.dependsOn = [...gstStep.dependsOn, newStep._id];
  await gstStep.save();

  profTaxStep.dependsOn = [...profTaxStep.dependsOn, newStep._id];
  await profTaxStep.save();

  task.steps = [...task.steps, newStep._id];
  await task.save();

  console.log(`Added "${NEW_STEP_NAME}" to "${task.title}", required by GST Registration and Professional Tax.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to add PAN card step:', err.message);
  process.exit(1);
});
