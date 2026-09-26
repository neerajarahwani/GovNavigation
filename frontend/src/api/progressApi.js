const BASE_URL = import.meta.env.VITE_API_BASE_URL

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function markStep({ taskId, stepId, completed }, token) {
  const response = await fetch(`${BASE_URL}/api/progress`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ taskId, stepId, completed }),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function getTaskProgress(taskId, token) {
  const response = await fetch(`${BASE_URL}/api/progress/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function listProgress(token) {
  const response = await fetch(`${BASE_URL}/api/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}
