const BASE_URL = import.meta.env.VITE_API_BASE_URL

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function listTasks(token) {
  const response = await fetch(`${BASE_URL}/api/admin/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function getTask(taskId, token) {
  const response = await fetch(`${BASE_URL}/api/admin/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function updateTask(taskId, fields, token) {
  const response = await fetch(`${BASE_URL}/api/admin/tasks/${taskId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(fields),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function updateStep(stepId, fields, token) {
  const response = await fetch(`${BASE_URL}/api/admin/steps/${stepId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(fields),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function verifyStep(stepId, token) {
  const response = await fetch(`${BASE_URL}/api/admin/steps/${stepId}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}
