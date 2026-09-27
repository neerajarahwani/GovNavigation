import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, BookOpen, Bookmark, HelpCircle, ChevronDown, Shield, LogOut } from 'lucide-react'
import NotificationBell from './NotificationBell'

function Header({ activeTab = 'home', onTabChange, taskId }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!showDropdown) return
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  function handleLogout() {
    setShowDropdown(false)
    logout()
    navigate('/login')
  }

  // On the home page, onTabChange opens the right modal in place. On any
  // other page (Login, Signup, Admin) there's no such handler, so instead
  // navigate to home and tell it which tab to open once it mounts.
  function handleTabClick(tab) {
    if (onTabChange) {
      onTabChange(tab)
      return
    }
    navigate('/', { state: tab === 'home' ? undefined : { openTab: tab } })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAE0D0] bg-[#FAF7F2]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-8 py-3">
        {/* Left: Brand & Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C84B24] text-white shadow-sm group-hover:scale-105 transition-transform">
            {/* Monument / Arch civic emblem icon */}
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7v2h20V7L12 2zm-8 9v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3zM2 20v2h20v-2H2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#1E293B]">
              Civic<span className="text-[#C84B24]">Path</span>
            </span>
            <span className="text-[11px] text-[#786E64] font-medium -mt-1 hidden sm:inline">
              Your Guide to Government Services
            </span>
          </div>
        </Link>

        {/* Center: Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#EBE1D3]">
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'home'
                ? 'bg-[#FAF7F2] text-[#C84B24] border border-[#E5D9C8] shadow-2xs'
                : 'text-[#5A5046] hover:text-[#1E293B]'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('Roadmaps')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'Roadmaps'
                ? 'bg-[#FAF7F2] text-[#C84B24] border border-[#E5D9C8] shadow-2xs'
                : 'text-[#5A5046] hover:text-[#1E293B]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>My Roadmaps</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('Saved')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'Saved'
                ? 'bg-[#FAF7F2] text-[#C84B24] border border-[#E5D9C8] shadow-2xs'
                : 'text-[#5A5046] hover:text-[#1E293B]'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('Help')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'Help'
                ? 'bg-[#FAF7F2] text-[#C84B24] border border-[#E5D9C8] shadow-2xs'
                : 'text-[#5A5046] hover:text-[#1E293B]'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </button>
        </nav>

        {/* Right: Notifications + User Profile Menu or Sign In / Register Buttons */}
        <div className="relative flex items-center gap-3">
          <NotificationBell taskId={taskId} />
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-lg border border-[#E5D9C8] bg-[#F7F1E5] px-3 py-1.5 text-xs font-bold text-[#8C3415] hover:bg-[#EFE5D4] transition"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <div className="relative" ref={userMenuRef}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 cursor-pointer rounded-xl p-1 hover:bg-[#F3EBE0] transition select-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-white shadow-2xs">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'CP'}
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#1E293B] whitespace-nowrap">
                  {user.name || 'User'}
                  <ChevronDown className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                </span>
              </div>

              {showDropdown && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border border-[#E5D9C8] bg-white p-2 shadow-lg z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-[#F0E6D8] mb-1">
                    <p className="text-xs font-bold text-[#1E293B]">{user.name || 'User'}</p>
                    <p className="text-[10px] text-[#64748B]">{user.email || ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false)
                      handleTabClick('Saved')
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#FAF7F2] transition"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-[#C84B24]" />
                    <span>Saved Roadmaps</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] hover:bg-[#F3EBE0] px-3.5 py-2 text-xs font-bold text-[#1E293B] transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

