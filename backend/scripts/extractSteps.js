// Turns real, pasted government page text into the same clean Step shape, using
// Gemini — but only using what's actually written in the given text, never
// answering from the model's own knowledge. Does NOT write to the database; it
// prints JSON for you to read and check by hand first.
//
// Run manually: node backend/scripts/extractSteps.js path/to/pasted-text.txt
require('dotenv').config();
const fs = require('fs');

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
  "prerequisites": []
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

  const model = 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: sourceText }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Gemini API call failed: ${response.status} ${errText}`);
    process.exit(1);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
