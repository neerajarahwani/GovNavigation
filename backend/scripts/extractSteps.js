// Turns real, pasted government page text into the same clean Step shape, using
// Gemini — but only using what's actually written in the given text, never
// answering from the model's own knowledge. Does NOT write to the database; it
// prints JSON for you to read and check by hand first.
//
// Run manually: node backend/scripts/extractSteps.js path/to/pasted-text.txt
require('dotenv').config();
const fs = require('fs');
const { askGemini } = require('../utils/geminiClient');

const SYSTEM_PROMPT = `You extract structured information from a piece of government
process text. Use ONLY information present in the text below. If a field is not
mentioned in the text, leave it as an empty string or empty array — do NOT guess,
infer, or fill it in from your own knowledge. Respond with ONLY valid JSON, no other
text, matching exactly this shape:
{
  "name": "",
  "department": "",
  "documents": [],
  "fees": "",
  "estimatedDays": null,
  "eligibility": "",
  "prerequisites": [],
  "description": "",
  "keyPoints": [],
  "govtTag": "",
  "sourceTitle": "",
  "subtitle": ""
}`;

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/extractSteps.js <path-to-text-file>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const sourceText = fs.readFileSync(filePath, 'utf-8').trim();
  if (!sourceText) {
    console.error('The input file is empty — nothing to extract from. Refusing to guess.');
    process.exit(1);
  }

  let rawText;
  try {
    rawText = await askGemini(SYSTEM_PROMPT, sourceText, { asJson: true });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  console.log('--- Extracted JSON (review before using) ---');
  console.log(rawText);
  console.log('---------------------------------------------');
  console.log('This was NOT saved to the database. Review it, then add it to a real');
  console.log('seed step by hand, filling in sourceUrl and lastVerified yourself.');
}

main().catch((err) => {
  console.error('Extraction failed:', err.message);
  process.exit(1);
});
