// Loads 2 made-up example tasks so the app has something to build/test against
// immediately. Safe to run more than once — it only ever removes/reinserts steps it
// tagged as placeholder (confidenceScore 0), never anything with real, sourced data.
// Run manually: node backend/scripts/seedPlaceholderTasks.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const PLACEHOLDER_SOURCE = 'PLACEHOLDER - not yet sourced';

const placeholderTasks = [
  {
    title: 'Register a small business',
    city: 'Mumbai',
    keywords: ['business', 'register', 'shop', 'trade license', 'mumbai'],
    steps: [
      {
        name: 'Get a Shop and Establishment License',
        department: 'Municipal Corporation',
        documents: ['ID proof', 'address proof', 'passport photo'],
        fees: '₹1000 (example)',
        estimatedDays: 7,
        eligibility: 'Any resident starting a shop or business',
        prerequisites: [],
      },
      {
        name: 'Apply for GST Registration',
        department: 'GST Department',
        documents: ['PAN card', 'business address proof'],
        fees: 'No fee (example)',
        estimatedDays: 5,
        eligibility: 'Business with turnover above the GST threshold',
        prerequisites: ['Get a Shop and Establishment License'],
      },
    ],
  },
  {
    title: 'Apply for a birth certificate',
    city: 'Mumbai',
    keywords: ['birth certificate', 'newborn', 'register birth', 'mumbai'],
    steps: [
      {
        name: 'Report the birth at the hospital or municipal office',
        department: 'Municipal Corporation - Birth & Death Registry',
        documents: ['Hospital discharge form', "parents' ID proof"],
        fees: 'No fee within 21 days (example)',
        estimatedDays: 1,
        eligibility: 'Parent or guardian of the newborn',
        prerequisites: [],
      },
      {
        name: 'Collect the printed birth certificate',
        department: 'Municipal Corporation - Birth & Death Registry',
        documents: ['Acknowledgement receipt from the report step'],
        fees: '₹50 (example)',
        estimatedDays: 3,
        eligibility: 'Parent or guardian of the newborn',
        prerequisites: ['Report the birth at the hospital or municipal office'],
      },
    ],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Only remove previously-seeded placeholder data, never anything real.
  const oldPlaceholderSteps = await Step.find({ confidenceScore: 0 });
  const oldPlaceholderStepIds = oldPlaceholderSteps.map((s) => s._id);
  const oldPlaceholderTaskIds = [...new Set(oldPlaceholderSteps.map((s) => String(s.taskId)))];

  await Step.deleteMany({ _id: { $in: oldPlaceholderStepIds } });
  await Task.deleteMany({ _id: { $in: oldPlaceholderTaskIds } });

  for (const taskData of placeholderTasks) {
    const task = await Task.create({
      title: taskData.title,
      city: taskData.city,
      keywords: taskData.keywords,
      steps: [],
    });

    const createdSteps = [];
    for (const stepData of taskData.steps) {
      const step = await Step.create({
        taskId: task._id,
        name: stepData.name,
        department: stepData.department,
        documents: stepData.documents,
        fees: stepData.fees,
        estimatedDays: stepData.estimatedDays,
        eligibility: stepData.eligibility,
        prerequisites: stepData.prerequisites,
        dependsOn: [],
        canRunParallelWith: [],
        sourceUrl: PLACEHOLDER_SOURCE,
        lastVerified: new Date(),
        confidenceScore: 0,
      });
      createdSteps.push(step);
    }

    // Wire up dependsOn now that every step in this task has an id, matching each
    // step's prerequisites (by name) to the step it depends on.
    for (let i = 0; i < createdSteps.length; i += 1) {
      const prereqNames = taskData.steps[i].prerequisites;
      const dependsOn = createdSteps
        .filter((s) => prereqNames.includes(s.name))
        .map((s) => s._id);
      createdSteps[i].dependsOn = dependsOn;
      await createdSteps[i].save();
    }

    task.steps = createdSteps.map((s) => s._id);
    await task.save();

    console.log(`Seeded placeholder task: "${task.title}" (${createdSteps.length} steps)`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to seed placeholder tasks:', err.message);
  process.exit(1);
});
