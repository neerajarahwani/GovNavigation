const BASE_URL = import.meta.env.VITE_API_BASE_URL

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// Public — no token. taskId is optional (global-only when omitted).
export async function getAnnouncements(taskId) {
  const url = taskId
    ? `${BASE_URL}/api/announcements?taskId=${taskId}`
    : `${BASE_URL}/api/announcements`
  const response = await fetch(url)
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function listAll(token) {
  const response = await fetch(`${BASE_URL}/api/admin/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function create(fields, token) {
  const response = await fetch(`${BASE_URL}/api/admin/announcements`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(fields),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function update(id, fields, token) {
  const response = await fetch(`${BASE_URL}/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(fields),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}
