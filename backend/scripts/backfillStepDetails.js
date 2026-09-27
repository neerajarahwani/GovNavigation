// One-off backfill: fills description/keyPoints/govtTag/sourceTitle/subtitle
// on existing steps that already have a real sourceUrl, by re-scraping that
// same URL and asking Gemini to extract ONLY these fields from that real text
// — never inventing content, same RAG-lite rule as extractSteps.js. Steps
// still on "PLACEHOLDER - not yet sourced" are skipped (nothing real to
// scrape). Skips a step if it already has a description (idempotent — safe to
// re-run after adding more real steps).
// Run manually: node backend/scripts/backfillStepDetails.js
require('dotenv').config();
const mongoose = require('mongoose');
const Step = require('../models/Step');
const { askGemini } = require('../utils/geminiClient');

const SYSTEM_PROMPT = `You extract structured information from a piece of government
process text. Use ONLY information present in the text below. If a field is not
mentioned in the text, leave it as an empty string or empty array — do NOT guess,
infer, or fill it in from your own knowledge. Respond with ONLY valid JSON, no other
text, matching exactly this shape:
{
  "description": "",
  "keyPoints": [],
  "govtTag": "",
  "sourceTitle": "",
  "subtitle": ""
}
Field meanings: "description" is a short 1-3 sentence plain-language summary of what this
page/step is about. "keyPoints" is a short list of the most important facts a citizen
should know. "govtTag" is the issuing authority level if stated or clearly named in the
text (e.g. "Government of India", "Government of Maharashtra") — leave empty if not
determinable from the text. "sourceTitle" is the page's own title/heading if present in
the text. "subtitle" is a short (under 10 words) one-line summary of the step.`;

async function scrapeUrl(url) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firecrawl request failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  if (!data.success || !data.data?.markdown) {
    throw new Error('Firecrawl returned no readable content for this URL.');
  }
  return data.data.markdown;
}

function parseJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('  Could not parse Gemini response as JSON, skipping:', rawText.slice(0, 200));
    return null;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const steps = await Step.find({
    sourceUrl: { $ne: 'PLACEHOLDER - not yet sourced' },
    description: { $in: [null, ''] },
  });

  if (steps.length === 0) {
    console.log('No steps need backfilling.');
    await mongoose.disconnect();
    return;
  }

  const byUrl = new Map();
  for (const step of steps) {
    if (!byUrl.has(step.sourceUrl)) byUrl.set(step.sourceUrl, []);
    byUrl.get(step.sourceUrl).push(step);
  }

  console.log(`${steps.length} step(s) across ${byUrl.size} unique real source URL(s) to backfill.\n`);

  for (const [url, urlSteps] of byUrl) {
    console.log(`Scraping ${url} ...`);
    let pageText;
    try {
      pageText = await scrapeUrl(url);
    } catch (err) {
      console.error(`  Scrape failed, skipping this URL: ${err.message}`);
      continue;
    }

    let rawText;
    try {
      rawText = await askGemini(SYSTEM_PROMPT, pageText, { asJson: true });
    } catch (err) {
      console.error(`  Gemini call failed, skipping this URL: ${err.message}`);
      continue;
    }

    const extracted = parseJson(rawText);
    if (!extracted) continue;

    for (const step of urlSteps) {
      step.description = extracted.description || '';
      step.keyPoints = extracted.keyPoints || [];
      step.govtTag = extracted.govtTag || '';
      step.sourceTitle = extracted.sourceTitle || '';
      step.subtitle = extracted.subtitle || '';
      step.lastVerified = new Date();
      await step.save();
      console.log(`  Updated step "${step.name}" (${step._id}).`);
    }
  }

  await mongoose.disconnect();
  console.log('\nBackfill complete.');
}

run().catch((err) => {
  console.error('Backfill failed:', err.message);
  process.exit(1);
});
