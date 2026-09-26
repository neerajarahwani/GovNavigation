import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Reads any previously-saved login from localStorage, so a page refresh doesn't
// log the person out.
function loadStoredAuth() {
  try {
    const token = localStorage.getItem('civicpath_token')
    const userRaw = localStorage.getItem('civicpath_user')
    if (!token || !userRaw) return { token: null, user: null }
    return { token, user: JSON.parse(userRaw) }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(loadStoredAuth)

  function login(newToken, newUser) {
    localStorage.setItem('civicpath_token', newToken)
    localStorage.setItem('civicpath_user', JSON.stringify(newUser))
    setAuth({ token: newToken, user: newUser })
  }

  function logout() {
    localStorage.removeItem('civicpath_token')
    localStorage.removeItem('civicpath_user')
    setAuth({ token: null, user: null })
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
