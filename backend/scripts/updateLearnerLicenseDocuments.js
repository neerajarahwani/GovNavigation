// Adds a real "Documents Required" step for the Learner's License stage,
// sourced from the official Form 2 application PDF's own annexure
// (parivahan.gov.in) — the original "Learner's License" step's source page
// covered only eligibility, not documents, so this is kept as its own step
// with its own real source rather than overwriting that step's sourceUrl.
// Runs in parallel with "Learner's License" (same stage, not sequential).
// Idempotent — safe to run more than once.
// Run manually: node backend/scripts/updateLearnerLicenseDocuments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Step = require('../models/Step');

const FORM_2_SOURCE = 'https://parivahan.gov.in/sites/default/files/DownloadForm/cmvr/FORM-2.pdf';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const learnerStep = await Step.findOne({ name: "Learner's License" });
  if (!learnerStep) {
    console.error('Step "Learner\'s License" not found — nothing to do.');
    process.exit(1);
  }

  const existing = await Step.findOne({ taskId: learnerStep.taskId, name: "Documents Required: Learner's License" });
  if (existing) {
    console.log('Already added — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const docsStep = await Step.create({
    taskId: learnerStep.taskId,
    name: "Documents Required: Learner's License",
    department: learnerStep.department,
    documents: [
      'Aadhaar Card',
      'Electoral Roll',
      'Life Insurance Policy',
      'Passport',
      'School Certificate',
      'Birth Certificate',
      'Pay slip issued by any office of the State or Central Government or a local body',
      'Affidavit sworn before an Executive Magistrate, Notary Public, or First Class Judicial Magistrate',
      'A certificate granted by a Registered Medical Practitioner (not below the rank of Civil Surgeon) as to the age of the applicant',
      'Any other document specified by the State Government',
    ],
    fees: '',
    estimatedDays: null,
    eligibility: '',
    prerequisites: [
      'Any ONE of these documents is accepted as proof of BOTH address and age — select only one if it covers both.',
      'Also required: a recent photograph, and a Parent/Guardian Declaration if the applicant is a minor.',
    ],
    dependsOn: [],
    canRunParallelWith: [learnerStep._id],
    sourceUrl: FORM_2_SOURCE,
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  learnerStep.canRunParallelWith = [...(learnerStep.canRunParallelWith || []), docsStep._id];
  await learnerStep.save();

  const Task = require('../models/Task');
  const task = await Task.findById(learnerStep.taskId);
  task.steps = [...task.steps, docsStep._id];
  await task.save();

  console.log("Added a real \"Documents Required: Learner's License\" step.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to update learner license documents:', err.message);
  process.exit(1);
});
