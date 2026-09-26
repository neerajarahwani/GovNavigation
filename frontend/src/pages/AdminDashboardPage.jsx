import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { listTasks, getTask, updateTask, updateStep, verifyStep } from '../api/adminApi'
import Header from '../components/Header'
import AdminTaskList from '../components/AdminTaskList'
import AdminTaskEditForm from '../components/AdminTaskEditForm'
import AdminStepEditForm from '../components/AdminStepEditForm'
import AdminAnnouncementsPanel from '../components/AdminAnnouncementsPanel'

function AdminDashboardPage() {
  const { user, token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [selected, setSelected] = useState(null) // { task, steps }
  const [errorMessage, setErrorMessage] = useState('')

  const refreshTaskList = useCallback(async () => {
    if (!token) return
    const response = await listTasks(token)
    if (response.success) setTasks(response.data)
  }, [token])

  useEffect(() => {
    if (user?.role === 'admin') refreshTaskList()
  }, [user, refreshTaskList])

  // Role guard — never even attempts an admin API call for a non-admin visitor.
  if (user?.role !== 'admin') {
    return (
      <main className="flex min-h-screen flex-col items-center gap-6 bg-slate-50 px-4 py-12">
        <Header />
        <p className="text-slate-600">You don't have access to this page.</p>
      </main>
    )
  }

  async function handleSelectTask(taskId) {
    setErrorMessage('')
    const response = await getTask(taskId, token)
    if (response.success) {
      setSelected(response.data)
    } else {
      setErrorMessage(response.error || 'Something went wrong.')
    }
  }

  async function handleSaveTask(fields) {
    const response = await updateTask(selected.task._id, fields, token)
    if (response.success) {
      setSelected((prev) => ({ ...prev, task: response.data }))
      refreshTaskList()
    }
    return response
  }

  async function handleSaveStep(stepId, fields) {
    const response = await updateStep(stepId, fields, token)
    if (response.success) {
      setSelected((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s._id === stepId ? response.data : s)),
      }))
      refreshTaskList()
    }
    return response
  }

  async function handleVerifyStep(stepId) {
    const response = await verifyStep(stepId, token)
    if (response.success) {
      setSelected((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s._id === stepId ? response.data : s)),
      }))
      refreshTaskList()
    }
    return response
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-slate-50 px-4 py-12">
      <Header />
      <div className="w-full max-w-3xl">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Admin dashboard</h1>

        {errorMessage && <p className="mb-3 text-sm text-red-600">{errorMessage}</p>}

        <AdminTaskList tasks={tasks} onSelectTask={handleSelectTask} />

        {selected && (
          <div className="mt-6 flex flex-col gap-4">
            <AdminTaskEditForm task={selected.task} onSave={handleSaveTask} />
            {selected.steps.map((step) => (
              <AdminStepEditForm
                key={step._id}
                step={{ ...step, stepId: step._id }}
                onSave={handleSaveStep}
                onVerify={handleVerifyStep}
              />
            ))}
          </div>
        )}

        <AdminAnnouncementsPanel token={token} tasks={tasks} />
      </div>
    </main>
  )
}

export default AdminDashboardPage
