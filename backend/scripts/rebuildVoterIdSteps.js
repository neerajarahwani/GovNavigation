// Splits the single "Register to Vote" step into 3 real steps, each sourced
// from the actual official Form-6 PDF (voters.eci.gov.in) — the previous
// version listed "Form 6" as if it were a supporting document, when it's
// really the application form itself, and never explained that the proof
// documents come in two separate any-ONE-of categories. Fixed the same way
// Passport's documents were split: one step per real category, all parallel.
// Note: the source PDF's "Proof of Date of Birth" list only rendered ONE
// item cleanly in text extraction (a genuine PDF-table limitation, not a
// guess) — it is left as that single real item rather than padded with
// unsourced guesses. Idempotent — safe to run more than once.
// Run manually: node backend/scripts/rebuildVoterIdSteps.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const TASK_TITLE = 'Register to Vote (Voter ID)';
const DEPARTMENT = 'Election Commission of India';
const FORM_SOURCE = 'https://voters.eci.gov.in/formspdf/Form_6_English.pdf';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const task = await Task.findOne({ title: TASK_TITLE });
  if (!task) {
    console.error(`Task "${TASK_TITLE}" not found — nothing to do.`);
    process.exit(1);
  }

  const alreadyRebuilt = await Step.findOne({ taskId: task._id, name: 'Documents Required: Proof of Residence' });
  if (alreadyRebuilt) {
    console.log('Already rebuilt — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  await Step.deleteMany({ taskId: task._id });

  const registerStep = await Step.create({
    taskId: task._id,
    name: 'Register to Vote (Form 6)',
    department: DEPARTMENT,
    documents: [],
    fees: 'Free of cost',
    estimatedDays: null,
    eligibility:
      'Indian citizen who has attained the age of 18 years on the qualifying date ' +
      '(1 Jan, 1 April, 1 July and 1 Oct of the year of revision of electoral roll), ' +
      'is an ordinary resident of the part/polling area of the constituency where you ' +
      'want to be enrolled, and is not disqualified to be enrolled as an elector.',
    prerequisites: [
      'A recent passport-size colour photograph (4.5cm x 3.5cm, white background).',
      'Aadhaar number, if available (for authentication of entries).',
    ],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: 'https://www.eci.gov.in/faq/en/how-to-register/',
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  const residenceStep = await Step.create({
    taskId: task._id,
    name: 'Documents Required: Proof of Residence',
    department: DEPARTMENT,
    documents: [
      'Water/Electricity/Gas connection bill for that address (at least 1 year)',
      'Aadhaar Card',
      'Current passbook of a Nationalized/Scheduled Bank or Post Office',
      'Indian Passport',
      "Revenue Department's land-owning records, including Kisan Bahi",
      'Registered Rent Lease Deed (in case of a tenant)',
      'Registered Sale Deed (in case of an owned house)',
    ],
    fees: '',
    estimatedDays: null,
    eligibility: '',
    prerequisites: [
      'Any ONE of these documents is accepted as proof of residence — a self-attested copy in the name of the applicant, or a parent/spouse/adult child already enrolled at the same address, is also accepted.',
    ],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: FORM_SOURCE,
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  const dobStep = await Step.create({
    taskId: task._id,
    name: 'Documents Required: Proof of Date of Birth',
    department: DEPARTMENT,
    documents: [
      'Birth certificate issued by a Competent Local Body/Municipal Authority/Registrar of Births & Deaths',
    ],
    fees: '',
    estimatedDays: null,
    eligibility: '',
    prerequisites: [
      'Any ONE of the documents listed on Form 6 is accepted as proof of date of birth (the official form lists more than one; only this item was cleanly readable from the scraped source).',
      "If none of these is available, applicants must appear in person before the Electoral Registration Officer for field verification.",
    ],
    dependsOn: [],
    canRunParallelWith: [],
    sourceUrl: FORM_SOURCE,
    lastVerified: new Date(),
    confidenceScore: 1,
  });

  const ids = [registerStep, residenceStep, dobStep];
  for (const step of ids) {
    step.canRunParallelWith = ids.filter((s) => String(s._id) !== String(step._id)).map((s) => s._id);
    await step.save();
  }

  task.steps = ids.map((s) => s._id);
  await task.save();

  console.log(`Rebuilt "${TASK_TITLE}" with 3 real steps (register + 2 document categories).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to rebuild voter ID steps:', err.message);
  process.exit(1);
});
