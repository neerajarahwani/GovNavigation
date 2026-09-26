import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import TaskInputPage from './pages/TaskInputPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Placeholder for group 4 — replaced with the real AdminDashboardPage there.
function AdminPagePlaceholder() {
  return <p className="p-8 text-center text-slate-500">Admin dashboard coming soon.</p>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskInputPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminPagePlaceholder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
