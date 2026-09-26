const Task = require('../models/Task');
const Step = require('../models/Step');
const { askGemini } = require('../utils/geminiClient');

const EXTRACT_PROMPT = `Read the citizen's request below. Identify only two things:
1. What government service/process they want (a few plain words, e.g. "business
   registration", "birth certificate").
2. What city they mentioned, if any.
Do not answer their question or add any other information. Respond with ONLY valid
JSON in exactly this shape: { "service": "", "city": "" }. Leave a field as an empty
string if it isn't mentioned.`;

// Escapes special pattern-matching characters so user-provided text can be safely
// dropped into a RegExp without changing its meaning or risking a slow pattern.
function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Splits text into lowercase words for simple keyword-overlap matching.
function toWordSet(text) {
  return new Set(
    (text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
}

// Finds the Task whose keywords best overlap with the extracted service words,
// preferring a city match when a city was given. Returns null if nothing scores
// above a minimum threshold — never guesses at a task with no real overlap.
async function findBestMatchingTask(serviceText, cityText) {
  const serviceWords = toWordSet(serviceText);
  if (serviceWords.size === 0) return null;

  const candidates = await Task.find(
    cityText ? { city: new RegExp(`^${escapeForRegex(cityText)}$`, 'i') } : {}
  );
  const pool = candidates.length > 0 ? candidates : await Task.find({});

  let best = null;
  let bestScore = 0;

  for (const task of pool) {
    // Keywords can be multi-word phrases (e.g. "birth certificate") — split each
    // one into individual words so it can match against Gemini's extracted words
    // the same way, instead of comparing whole phrases to single words.
    const keywordWords = new Set(task.keywords.flatMap((k) => Array.from(toWordSet(k))));
    let score = 0;
    for (const word of serviceWords) {
      if (keywordWords.has(word)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = task;
    }
  }

  return bestScore > 0 ? best : null;
}

// POST /api/tasks/query
async function query(req, res) {
  const { text, city } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Please describe what you need help with.' });
  }

  let extracted;
  try {
    const raw = await askGemini(EXTRACT_PROMPT, text, { asJson: true });
    extracted = JSON.parse(raw);
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Could not process your request right now — please try again.' });
  }

  const cityToUse = city || extracted.city;
  const task = await findBestMatchingTask(extracted.service, cityToUse);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: "We don't have information on this yet. Try describing it differently.",
    });
  }

  const steps = await Step.find({ taskId: task._id }).sort({ createdAt: 1 });

  return res.status(200).json({
    success: true,
    data: {
      task: { taskId: task._id, title: task.title, city: task.city },
      steps: steps.map((s) => ({
        stepId: s._id,
        name: s.name,
        department: s.department,
        documents: s.documents,
        fees: s.fees,
        estimatedDays: s.estimatedDays,
        eligibility: s.eligibility,
        prerequisites: s.prerequisites,
        dependsOn: s.dependsOn,
        sourceUrl: s.sourceUrl,
        lastVerified: s.lastVerified,
      })),
    },
  });
}

module.exports = { query };
