const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Calls the backend's task-search endpoint with the citizen's typed text and/or a
// chosen city. Returns the parsed JSON either way — the caller checks
// `success`/`status` to decide what to show, this function never throws for a
// normal 4xx/5xx response, only for a real network failure.
export async function queryTask({ text, city }) {
  const response = await fetch(`${BASE_URL}/api/tasks/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, city }),
  })

  const body = await response.json()
  return { status: response.status, ...body }
}
