// One-off: populates Task.departments for each task, using real portal URLs
// (the same domains already used and verified elsewhere in this project as
// step sourceUrls) and only including a helpline number where it was
// confirmed directly from the department's own official page or an official
// Government of India press release — never a number only seen on a
// third-party aggregator site. Where that confirmation wasn't possible, the
// helpline is left blank rather than guessed (data-integrity rule).
// Run manually: node backend/scripts/populateTaskDepartments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

// Department name (as it appears on Step.department) -> real info.
// sourceUrl is the exact page the portalUrl/helpline claim was confirmed on.
const DEPARTMENTS = {
  'Municipal Corporation': {
    portalUrl: 'https://aaplesarkar.mahaonline.gov.in/en/Login/Certificate_Documents?ServiceId=3580',
    helpline: '',
    sourceUrl: 'https://aaplesarkar.mahaonline.gov.in/en/Login/Certificate_Documents?ServiceId=3580',
  },
  'GST Department': {
    portalUrl: 'https://www.gst.gov.in/',
    helpline: '1800-103-4786',
    sourceUrl: 'https://www.gst.gov.in/contact',
  },
  'Maharashtra Goods and Services Tax Department (MGSTD)': {
    portalUrl: 'https://www.mahagst.gov.in/',
    helpline: '',
    sourceUrl:
      'https://www.mahagst.gov.in/public/static-doc/PTEC_PTRC_New%20Registration_Instruction%20Page%20-%20User%20Manual.pdf',
  },
  'Income Tax Department': {
    portalUrl: 'https://www.incometax.gov.in/',
    helpline: '',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/instant-e-pan',
  },
  'Office of The Registrar General and Census Commissioner, India': {
    portalUrl: 'https://dc.crsorgi.gov.in/crs/',
    helpline: '',
    sourceUrl: 'https://dc.crsorgi.gov.in/crs/',
  },
  'Ministry of Micro, Small and Medium Enterprises': {
    portalUrl: 'https://www.udyamregistration.gov.in/',
    helpline: '+91 8308809334',
    sourceUrl: 'https://www.udyamregistration.gov.in/',
  },
  'Election Commission of India': {
    portalUrl: 'https://www.eci.gov.in/',
    helpline: '1950',
    sourceUrl: 'https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1566029&reg=48&lang=2',
  },
  'Ministry of External Affairs (Passport Seva)': {
    portalUrl: 'https://www.passportindia.gov.in/',
    helpline: '',
    sourceUrl: 'https://www.passportindia.gov.in/psp/onlineHtml/feeDocument',
  },
  'Ministry of Road Transport & Highways': {
    portalUrl: 'https://parivahan.gov.in/',
    helpline: '',
    sourceUrl: 'https://parivahan.gov.in/en/content/learners-license',
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const tasks = await Task.find({});
  const Step = require('../models/Step');

  for (const task of tasks) {
    const steps = await Step.find({ taskId: task._id }, 'department').lean();
    const deptNames = [...new Set(steps.map((s) => s.department).filter(Boolean))];

    let added = 0;
    for (const name of deptNames) {
      const info = DEPARTMENTS[name];
      if (!info) {
        console.log(`No known info for department "${name}" (task "${task.title}") — skipping.`);
        continue;
      }
      const alreadyHas = task.departments.some((d) => d.name === name);
      if (alreadyHas) continue;

      task.departments.push({
        name,
        portalUrl: info.portalUrl,
        helpline: info.helpline,
        sourceUrl: info.sourceUrl,
        lastVerified: new Date(),
        confidenceScore: 1,
      });
      added += 1;
    }

    if (added > 0) {
      await task.save();
      console.log(`Added ${added} department(s) to task "${task.title}".`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Populate failed:', err.message);
  process.exit(1);
});
