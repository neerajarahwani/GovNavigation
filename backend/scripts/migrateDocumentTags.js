// One-off: converts Step.documents from a plain list of strings into a list of
// { name, tag } objects, categorizing each existing (already real, already
// sourced) document name into a fixed tag using Gemini. This is a
// classification of real data that already exists in the database, not fact
// extraction from a new source — no new sourceUrl/lastVerified is needed,
// since nothing new is being claimed about the document itself.
// Run manually: node backend/scripts/migrateDocumentTags.js
require('dotenv').config();
const mongoose = require('mongoose');
const Step = require('../models/Step');
const { askGemini } = require('../utils/geminiClient');

const TAGS = [
  'Identity Proof',
  'Address Proof',
  'Date of Birth Proof',
  'Photograph',
  'Business/Registration Document',
  'Financial Document',
  'Acknowledgement/Receipt',
  'Other',
];

const SYSTEM_PROMPT = `You categorize a list of government document names into a fixed
set of tags. For each document name given, choose exactly one tag from this list:
${TAGS.map((t) => `"${t}"`).join(', ')}.
Respond with ONLY valid JSON: an array of objects, one per input document, in the same
order, each shaped { "name": "<the input name unchanged>", "tag": "<chosen tag>" }.`;

function isPlainStringArray(documents) {
  return Array.isArray(documents) && documents.every((d) => typeof d === 'string');
}

function parseJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('  Could not parse Gemini response as JSON:', rawText.slice(0, 200));
    return null;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Mongoose's schema is already the new shape, so read documents as raw
  // driver data to see what's actually stored (old string arrays included).
  const steps = await Step.collection.find({}).toArray();
  const toMigrate = steps.filter((s) => isPlainStringArray(s.documents) && s.documents.length > 0);
  const alreadyTagged = steps.filter(
    (s) => Array.isArray(s.documents) && s.documents.every((d) => d && typeof d === 'object')
  );

  console.log(`${toMigrate.length} step(s) need document-tag migration.`);
  console.log(`${alreadyTagged.length} step(s) already in the new shape — skipping.\n`);

  for (const step of toMigrate) {
    console.log(`Tagging documents for step "${step.name}" (${step._id}) ...`);
    let rawText;
    try {
      rawText = await askGemini(SYSTEM_PROMPT, JSON.stringify(step.documents), { asJson: true });
    } catch (err) {
      console.error(`  Gemini call failed, skipping: ${err.message}`);
      continue;
    }

    const tagged = parseJson(rawText);
    if (!Array.isArray(tagged)) {
      console.error('  Response was not an array, skipping.');
      continue;
    }

    const cleaned = tagged
      .filter((d) => d && typeof d.name === 'string' && d.name.trim())
      .map((d) => ({ name: d.name, tag: TAGS.includes(d.tag) ? d.tag : 'Other' }));

    await Step.collection.updateOne({ _id: step._id }, { $set: { documents: cleaned } });
    console.log(`  Updated with ${cleaned.length} tagged document(s).`);
  }

  await mongoose.disconnect();
  console.log('\nMigration complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
