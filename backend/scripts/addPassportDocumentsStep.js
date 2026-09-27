// Adds two real document-category steps to the Passport task, each sourced
// from its own real official passportindia.gov.in page:
//   - Proof of Address        -> /psp/ListDocuments
//   - Proof of Date of Birth  -> /psp/ListDOB
// These are kept as two separate steps (not one merged list) because each
// category has its OWN real source page, and within a category the applicant
// only needs ANY ONE document — lumping both categories into one flat list
// hid that distinction. All three steps (fees, address proof, DOB proof) run
// in parallel with each other — they're independent facts to know before
// applying, not a sequence. Eligibility criteria text was searched for but
// never found on a clean, scrapable official static page (only inside the
// session-locked application wizard), so it's left empty rather than guessed,
// per the project's RAG-lite rule. Idempotent — safe to run more than once.
// Run manually: node backend/scripts/addPassportDocumentsStep.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const TASK_TITLE = 'Apply for a Passport';
const DEPARTMENT = 'Ministry of External Affairs (Passport Seva)';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const task = await Task.findOne({ title: TASK_TITLE });
  if (!task) {
    console.error(`Task "${TASK_TITLE}" not found — nothing to do.`);
    process.exit(1);
  }

  // Remove the earlier merged "Documents Required" step (both categories
  // lumped together) so it can be replaced with the two proper ones below.
  const merged = await Step.findOne({ taskId: task._id, name: 'Documents Required' });
  if (merged) {
    await Step.deleteOne({ _id: merged._id });
  }

  const alreadySplit = await Step.findOne({ taskId: task._id, name: 'Documents Required: Proof of Address' });
  if (alreadySplit) {
    console.log('Already split into categories — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const feeStep = await Step.findOne({ taskId: task._id, name: 'Passport Fee Structure' });

  const addressStep = await Step.create({
    taskId: task._id,
    name: 'Documents Required: Proof of Address',
    department: DEPARTMENT,
    documents: [
      'Water Bill',
      'Telephone (landline or post paid mobile bill)',
      'Electricity bill',
      'Income Tax Assessment Order',
      'Election Commission Photo ID card',
      'Proof of Gas Connection',
      'Certificate from Employer of reputed companies on letter head',
      "Spouse's passport copy (First and last page including family details mentioning applicant's name as spouse of the passport holder)",
      "Parent's passport copy, in case of minors (First and last page)",
      'Aadhaar Card',
      'Rent Agreement',
      'Photo Passbook of running Bank Account (Scheduled Public Sector Banks, Scheduled Private Sector Indian Banks and Regional Rural Banks only)',
    ],
    fees: '',
    estimatedDays: null,
    eligibility: '',
    prerequisites: ['Any ONE of these documents is accepted as proof of address.'],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: 'https://www.passportindia.gov.in/psp/ListDocuments',
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  const dobStep = await Step.create({
    taskId: task._id,
    name: 'Documents Required: Proof of Date of Birth',
    department: DEPARTMENT,
    documents: [
      'Birth certificate issued by the Registrar of Births and Deaths or the Municipal Corporation or any other authority empowered under the Registration of Births and Deaths Act, 1969',
      'Transfer or school leaving or matriculation certificate issued by the recognised school last attended or recognised educational board, having the date of birth',
      'Permanent Account Number (PAN) Card, having the date of birth',
      'Copy of an extract of the service record of the applicant (Government servants only), or the Pay Pension Order (retired Government servants), duly attested, having the date of birth',
      "Driving licence issued by the Transport Department of the concerned State Government, having the date of birth",
      'Election Photo Identity Card issued by the Election Commission of India, containing the date of birth',
      'Policy bond issued by the Life Insurance Corporation of India or Public Companies, having the date of birth of the holder',
    ],
    fees: '',
    estimatedDays: null,
    eligibility: '',
    prerequisites: ['Any ONE of these documents is accepted as proof of date of birth.'],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: 'https://www.passportindia.gov.in/psp/ListDOB',
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  // Every pair among the three steps can run in parallel.
  const ids = [feeStep, addressStep, dobStep].filter(Boolean);
  for (const step of ids) {
    step.canRunParallelWith = ids.filter((s) => String(s._id) !== String(step._id)).map((s) => s._id);
    await step.save();
  }

  task.steps = ids.map((s) => s._id);
  await task.save();

  console.log(`Split documents into 2 real category steps for "${TASK_TITLE}".`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to add passport document category steps:', err.message);
  process.exit(1);
});
