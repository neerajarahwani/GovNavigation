// Shared helper for calling Gemini. Any code that needs an AI call should use this
// instead of writing its own fetch call, so there's one place to fix/change things.
// Using the "lite" model on purpose — it has a much higher free-tier daily quota
// than the newer flagship models (gemini-3.8-flash's free tier is capped at just
// 20 requests/day, which is exhausted in minutes of normal testing).
const MODEL = 'gemini-3.5-flash-lite';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sends a system instruction + user text to Gemini and returns the raw text reply.
// Retries a couple of times on a 503 (Gemini's own "temporarily overloaded" error),
// since that's a transient issue on Google's side, not a real failure. Throws on any
// other failure (network, bad key, bad response) — callers decide how to handle that
// (e.g. return a clean error to the client instead of crashing).
const REQUEST_TIMEOUT_MS = 20000;

async function askGemini(systemInstruction, userText, { asJson = false } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // Without an explicit timeout, an unreachable/slow Gemini leaves this
    // fetch pending forever — the caller's whole request would hang with no
    // error ever reaching the client.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
          ...(asJson ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        // A full network timeout means the service is unreachable, not
        // momentarily busy — retrying won't help, so fail fast instead of
        // making the caller wait through several more timeouts.
        throw new Error('Gemini API call timed out — the AI service is not responding right now.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const errText = await response.text();
    const isOverloaded = response.status === 503;
    if (isOverloaded && attempt < maxAttempts) {
      await wait(attempt * 800);
      continue;
    }
    throw new Error(`Gemini API call failed: ${response.status} ${errText}`);
  }
}

module.exports = { askGemini };
