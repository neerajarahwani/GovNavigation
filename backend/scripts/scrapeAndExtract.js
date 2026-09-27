// Real RAG-lite pipeline, end to end: scrapes a real government page with
// Firecrawl, then asks Gemini to extract structured step facts using ONLY the
// scraped text — never filling gaps from its own knowledge (same guardrail as
// extractSteps.js). Does NOT write to the database — prints JSON for manual
// review first, matching this project's data-integrity rule.
// Run manually: node backend/scripts/scrapeAndExtract.js <url>
require('dotenv').config();
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

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/scrapeAndExtract.js <url>');
    process.exit(1);
  }

  console.log(`Scraping ${url} ...`);
  const pageText = await scrapeUrl(url);
  console.log(`Got ${pageText.length} characters of real page content.`);

  console.log('Asking Gemini to extract facts from ONLY this text ...');
  const rawText = await askGemini(SYSTEM_PROMPT, pageText, { asJson: true });

  console.log('\n--- Extracted JSON (review before using) ---');
  console.log(rawText);
  console.log('---------------------------------------------');
  console.log(`Real source: ${url}`);
  console.log('This was NOT saved to the database. Review it, then add it to a real');
  console.log('seed step by hand, filling in sourceUrl and lastVerified yourself.');
}

main().catch((err) => {
  console.error('Scrape + extract failed:', err.message);
  process.exit(1);
});
