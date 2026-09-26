// Turns real, pasted government page text into the same clean Step shape, using
// Claude — but only using what's actually written in the given text, never
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: sourceText }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Claude API call failed: ${response.status} ${errText}`);
    process.exit(1);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '';

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
