// Adds 3 more real, government-sourced tasks — each extracted by
// scrapeAndExtract.js from a real official page, reviewed by hand, then added
// here with a real sourceUrl and confidenceScore: 1. Same pattern as
// addRealUdyamStep.js: each is its own separate task, never mixed with
// placeholder data. Idempotent — safe to run more than once.
// Run manually: node backend/scripts/addMoreRealServices.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Step = require('../models/Step');

const REAL_TASKS = [
  {
    title: 'Register to Vote (Voter ID)',
    city: 'All India',
    keywords: ['voter id', 'voting', 'register to vote', 'election', 'eci', 'electoral roll'],
    step: {
      name: 'Register to Vote',
      department: 'Election Commission of India',
      documents: ['Form 6'],
      fees: 'Free of cost',
      estimatedDays: null,
      eligibility:
        'Indian citizen who has attained the age of 18 years on the qualifying date ' +
        '(1 Jan, 1 April, 1 July and 1 Oct of the year of revision of electoral roll), ' +
        'is an ordinary resident of the part/polling area of the constituency where you ' +
        'want to be enrolled, and is not disqualified to be enrolled as an elector.',
      prerequisites: [],
      sourceUrl: 'https://www.eci.gov.in/faq/en/how-to-register/',
    },
  },
  {
    title: 'Apply for a Passport',
    city: 'All India',
    keywords: ['passport', 'passport seva', 'travel document', 'tatkaal passport'],
    step: {
      name: 'Passport Fee Structure',
      // The extracted fee table itself didn't name the department, but
      // Passport Seva is unambiguously run by the Ministry of External
      // Affairs — a well-established public fact, not an invented detail.
      department: 'Ministry of External Affairs (Passport Seva)',
      documents: [],
      fees:
        'Fresh Passport/Re-issue (36 pages, 10 years): Rs.2,500; (60 pages, 10 years): Rs.3,500; ' +
        'Minors (below 18 years, 5 years): Rs.1,750; Replacement lost/damaged/stolen (36 pages, 5 year): ' +
        'Rs.4,250; (36 pages, 10 year): Rs.5,000; (60 pages): Rs.6,000; Police Clearance Certificate ' +
        '(PCC): Rs.750; Additional Tatkaal Fee: Rs.2,500 for applicable services.',
      estimatedDays: null,
      eligibility: '',
      prerequisites: [],
      sourceUrl: 'https://www.passportindia.gov.in/psp/onlineHtml/feeDocument',
    },
  },
  {
    title: 'Apply for or Renew a Driving License',
    city: 'All India',
    keywords: ['driving license', 'driving licence', 'learner license', 'dl', 'parivahan', 'sarathi'],
    step: {
      name: 'Licensing Related Fees and Charges',
      department: 'Ministry of Road Transport & Highways',
      documents: [],
      fees:
        "Rs.150 for learner's licence; Rs.50 for learner's licence test fee; Rs.300 for competence " +
        'to drive test; Rs.200 for driving licence issue; Rs.1000 for International Driving Permit; ' +
        'Rs.500 for addition of another class of vehicle; Rs.1000 for endorsement/renewal of ' +
        'authorisation for hazardous goods; Rs.200 for renewal of driving licence; Rs.300 for renewal ' +
        'after grace period (plus Rs.1000 per year of delay); Rs.200 for change in address or particulars.',
      estimatedDays: null,
      eligibility: '',
      prerequisites: ['A valid Learner License is required before applying for a permanent Driving License.'],
      sourceUrl: 'https://parivahan.gov.in/en/content/licensing-related-fees-charges',
    },
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const entry of REAL_TASKS) {
    let task = await Task.findOne({ title: entry.title });
    if (task && task.steps.length > 0) {
      console.log(`"${entry.title}" already exists with a step — skipping.`);
      continue;
    }
    if (task && task.steps.length === 0) {
      console.log(`"${entry.title}" exists but has no step (an earlier run failed partway) — completing it now.`);
    } else {
      task = await Task.create({
        title: entry.title,
        city: entry.city,
        keywords: entry.keywords,
        steps: [],
      });
    }

    const step = await Step.create({
      taskId: task._id,
      ...entry.step,
      dependsOn: [],
      canRunParallelWith: [],
      lastVerified: new Date(),
      confidenceScore: 1,
    });

    task.steps = [step._id];
    await task.save();

    console.log(`Added real task "${entry.title}", sourced from ${entry.step.sourceUrl}.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to add real services:', err.message);
  process.exit(1);
});
