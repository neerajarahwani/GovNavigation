// One-off: replaces the 6 remaining "PLACEHOLDER - not yet sourced" steps with
// real, government-sourced content. Each step is mapped to a real official
// government page (found by web search, reviewed by hand below), scraped with
// Firecrawl, then fully re-extracted with Gemini using ONLY that page's real
// text — same RAG-lite rule as extractSteps.js. Replaces ALL content fields
// (not just the 5 new ones), since the existing placeholder text was
// hand-written, not sourced, and the data-integrity rule requires every step
// to carry a real source for everything it says.
// Run manually: node backend/scripts/sourcePlaceholderSteps.js
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
  "name": "",
  "department": "",
  "documents": [{ "name": "", "tag": "" }],
  "fees": "",
  "estimatedDays": null,
  "eligibility": "",
  "prerequisites": [],
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
the text. "subtitle" is a short (under 10 words) one-line summary of the step.
Each entry in "documents" should have a "name" (the document exactly as named in the
text) and a "tag" categorizing what kind of document it is, chosen from this fixed
list: "Identity Proof", "Address Proof", "Date of Birth Proof", "Photograph",
"Business/Registration Document", "Financial Document", "Acknowledgement/Receipt",
"Other". Choosing a category for a real, named document is fine even though it isn't
written in the text verbatim — but never invent a document that isn't named in the text.`;

// Step name (as it currently exists) -> real official source found by search.
const SOURCES = {
  'Apply for a PAN Card':
    'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/instant-e-pan',
  'Apply for GST Registration': 'https://www.gst.gov.in/help/enrollmentwithgst',
  'Get a Shop and Establishment License':
    'https://aaplesarkar.mahaonline.gov.in/en/Login/Certificate_Documents?ServiceId=3580',
  'Register for Professional Tax':
    'https://www.mahagst.gov.in/public/static-doc/PTEC_PTRC_New%20Registration_Instruction%20Page%20-%20User%20Manual.pdf',
  'Report the birth at the hospital or municipal office': 'https://dc.crsorgi.gov.in/crs/',
  'Collect the printed birth certificate': 'https://dc.crsorgi.gov.in/crs/',
};

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

  const scrapeCache = new Map();

  for (const [stepName, url] of Object.entries(SOURCES)) {
    const step = await Step.findOne({ name: stepName, sourceUrl: 'PLACEHOLDER - not yet sourced' });
    if (!step) {
      console.log(`"${stepName}" not found (or already sourced) — skipping.`);
      continue;
    }

    if (!scrapeCache.has(url)) {
      console.log(`Scraping ${url} ...`);
      try {
        scrapeCache.set(url, await scrapeUrl(url));
      } catch (err) {
        console.error(`  Scrape failed, skipping steps for this URL: ${err.message}`);
        scrapeCache.set(url, null);
      }
    }
    const pageText = scrapeCache.get(url);
    if (!pageText) continue;

    let rawText;
    try {
      rawText = await askGemini(SYSTEM_PROMPT, pageText, { asJson: true });
    } catch (err) {
      console.error(`  Gemini call failed for "${stepName}": ${err.message}`);
      continue;
    }

    const extracted = parseJson(rawText);
    if (!extracted) continue;

    // Keep the original step name (so existing dependsOn/canRunParallelWith
    // wiring and any UI referencing this step by name stays intact) unless
    // the source didn't give a name at all.
    step.department = extracted.department || step.department;
    step.documents = extracted.documents || [];
    step.fees = extracted.fees || '';
    step.estimatedDays = extracted.estimatedDays ?? null;
    step.eligibility = extracted.eligibility || '';
    step.prerequisites = extracted.prerequisites || [];
    step.description = extracted.description || '';
    step.keyPoints = extracted.keyPoints || [];
    step.govtTag = extracted.govtTag || '';
    step.sourceTitle = extracted.sourceTitle || '';
    step.subtitle = extracted.subtitle || '';
    step.sourceUrl = url;
    step.lastVerified = new Date();
    step.confidenceScore = 1;
    await step.save();

    console.log(`  Sourced "${stepName}" from ${url}.`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Sourcing failed:', err.message);
  process.exit(1);
});
