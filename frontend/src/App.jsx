import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import TaskInputPage from './pages/TaskInputPage'

// Placeholders for group 2 — replaced with the real LoginPage/SignupPage there.
function LoginPagePlaceholder() {
  return <p className="p-8 text-center text-slate-500">Login page coming soon.</p>
}
function SignupPagePlaceholder() {
  return <p className="p-8 text-center text-slate-500">Signup page coming soon.</p>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskInputPage />} />
          <Route path="/login" element={<LoginPagePlaceholder />} />
          <Route path="/signup" element={<SignupPagePlaceholder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
