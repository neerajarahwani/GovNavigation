// Replaces the single generic "Licensing Related Fees and Charges" step with
// two real, properly sequential steps extracted from parivahan.gov.in:
// Learner's License, then Permanent License (which genuinely depends on it in
// real life — a valid Learner's License for 30+ days is a real prerequisite).
// This makes the real driving-license task actually show a multi-step graph,
// not just one box, matching the same visual richness as the fictional demo
// task. Idempotent — safe to run more than once.
// Run manually: node backend/scripts/rebuildDrivingLicenseSteps.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const TASK_TITLE = 'Apply for or Renew a Driving License';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const task = await Task.findOne({ title: TASK_TITLE });
  if (!task) {
    console.error(`Task "${TASK_TITLE}" not found — nothing to do.`);
    process.exit(1);
  }

  const alreadyRebuilt = await Step.findOne({ taskId: task._id, name: "Learner's License" });
  if (alreadyRebuilt) {
    console.log('Already rebuilt — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  // Remove the old single generic step (real fee data, just not a real "step
  // in a journey" the way this one is) and its task reference.
  await Step.deleteMany({ taskId: task._id });

  const learnerStep = await Step.create({
    taskId: task._id,
    name: "Learner's License",
    department: 'Ministry of Road Transport & Highways',
    documents: [],
    fees: '',
    estimatedDays: null,
    eligibility:
      'An applicant under 18 may be granted a learner’s licence to drive a motor cycle ' +
      'without gear, with written consent from a guardian. An applicant who has completed 18 ' +
      'years is eligible to apply for a licence to drive a motor vehicle other than a transport ' +
      'vehicle. An applicant who has completed 20 years is eligible to apply for a licence to ' +
      'drive a transport vehicle.',
    prerequisites: [],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: 'https://parivahan.gov.in/en/content/learners-license',
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  const permanentStep = await Step.create({
    taskId: task._id,
    name: 'Permanent License',
    department: 'Ministry of Road Transport & Highways',
    documents: ['Form 4', "Learner's Licence"],
    fees: 'Fees as prescribed along with user charges',
    estimatedDays: null,
    eligibility:
      "The applicant who has held a valid Learner's Licence for a period of at least 30 days " +
      'shall be competent to appear for the test of competence.',
    prerequisites: [
      "Valid Learner's Licence for a period of at least 30 days",
      'Schedule an appointment for the test of competence',
      'Bring a vehicle of the type to which the application relates',
    ],
    dependsOn: [learnerStep._id],
    canRunParallelWith: [],
    sourceUrl: 'https://parivahan.gov.in/en/content/permanent-license',
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  task.steps = [learnerStep._id, permanentStep._id];
  await task.save();

  console.log(`Rebuilt "${TASK_TITLE}" with 2 real, sequential steps.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to rebuild driving license steps:', err.message);
  process.exit(1);
});
