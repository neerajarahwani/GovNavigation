import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as signupApi, login as loginApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)
    try {
      const signupResponse = await signupApi({ name, email, password })
      if (!signupResponse.success) {
        setErrorMessage(signupResponse.error || 'Something went wrong. Please try again.')
        return
      }
      // Signup doesn't return a token (per the auth contract) — log in right after.
      const loginResponse = await loginApi({ email, password })
      if (loginResponse.success) {
        login(loginResponse.data.token, loginResponse.data.user)
        navigate('/')
      } else {
        navigate('/login')
      }
    } catch {
      setErrorMessage('Could not reach the server — please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-50 px-4 py-12">
      <Header />
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">Sign up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {isLoading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600 underline">Log in</Link>
        </p>
      </div>
    </main>
  )
}

export default SignupPage
