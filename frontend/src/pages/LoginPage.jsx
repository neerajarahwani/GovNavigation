import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { login as loginApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, User, ShieldAlert } from 'lucide-react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login: setAuthUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await loginApi(email, password)
      if (res.success && res.data) {
        setAuthUser(res.data.token, res.data.user)
        navigate('/')
      } else {
        setError(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleDemoFill(demoEmail, demoPassword) {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Warm Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gradient-to-b from-[#C84B24]/10 via-[#F5E6CD]/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 h-72 w-72 rounded-full bg-[#E05628]/10 blur-3xl pointer-events-none" />

      {/* Sticky Header Bar */}
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-civic-sm border border-[#E5D9C8] space-y-6 relative overflow-hidden">
            {/* Soft Ambient Card Glow */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#FFF4F0] blur-2xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4F0] text-[#C84B24] border border-[#FADCD1] shadow-2xs mb-1">
                <LogIn className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-serif-title font-bold text-[#1E293B] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-[#64748B] font-medium">
                Log in to access your saved civic roadmaps & track progress
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] pl-10 pr-4 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] pl-10 pr-10 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#94A3B8] hover:text-[#1E293B] transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] py-3 px-4 font-bold text-xs text-white shadow-md shadow-[#C84B24]/20 disabled:opacity-50 transition active:scale-[0.99]"
              >
                {isLoading ? 'Signing in...' : 'Log In to CivicPath →'}
              </button>
            </form>

            {/* Quick Demo Shortcuts */}
            <div className="pt-3 border-t border-[#F0E6D8]">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#C84B24] mb-2">
                <Sparkles className="h-3 w-3 text-[#C84B24]" />
                <span>QUICK FILL DEMO ACCOUNTS</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('citizen@example.com', 'Password123!')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#EBE1D3] bg-[#FAF7F2] py-1.5 px-2 text-[11px] font-semibold text-[#1E293B] hover:border-[#C84B24] hover:bg-[#FFF4F0] hover:text-[#C84B24] transition"
                >
                  <User className="h-3 w-3 text-[#C84B24]" />
                  <span>Citizen Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@civicpath.gov', 'AdminPassword123!')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#F5E6CD] bg-[#FFF8EC] py-1.5 px-2 text-[11px] font-semibold text-[#8C5815] hover:bg-[#FFEFCB] transition"
                >
                  <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                  <span>Admin Demo</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-[#64748B] font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-[#C84B24] hover:underline">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs font-semibold text-[#64748B] border-t border-[#EAE0D0] bg-[#FAF7F2]">
        CivicPath © 2026 — Secure Citizen Authentication
      </footer>
    </div>
  )
}

export default LoginPage
