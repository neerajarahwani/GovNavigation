const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function signup({ name, email, password }) {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}

export async function login({ email, password }) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json()
  return { status: response.status, ...body }
}
