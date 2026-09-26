import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="flex w-full max-w-4xl items-center justify-between py-2 text-sm">
      <Link to="/" className="font-semibold text-slate-900">
        CivicPath
      </Link>
      {user ? (
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link to="/admin" className="text-blue-600 underline">
              Admin
            </Link>
          )}
          <span className="text-slate-600">Hi, {user.name}</span>
          <button type="button" onClick={handleLogout} className="text-blue-600 underline">
            Log out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-blue-600 underline">
            Log in
          </Link>
          <Link to="/signup" className="text-blue-600 underline">
            Sign up
          </Link>
        </div>
      )}
    </header>
  )
}

export default Header
