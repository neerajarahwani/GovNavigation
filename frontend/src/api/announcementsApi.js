const BASE_URL = import.meta.env.VITE_API_BASE_URL

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// Public — works without a token, but pass one when available so the backend
// can mark each announcement's isRead for the current user. taskId is optional
// (global-only when omitted).
export async function getAnnouncements(taskId, token) {
  const url = taskId
    ? `${BASE_URL}/api/announcements?taskId=${taskId}`
    : `${BASE_URL}/api/announcements`
  const response = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
  const body = await response.json()
  return { status: response.status, ...body }
}

// Marks the given announcement ids as read for the logged-in user.
export async function markAnnouncementsRead(ids, token) {
  const response = await fetch(`${BASE_URL}/api/announcements/read`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  })
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
