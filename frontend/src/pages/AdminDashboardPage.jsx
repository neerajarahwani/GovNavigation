import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { listTasks, getTask, updateTask, updateStep, verifyStep } from '../api/adminApi'
import Header from '../components/Header'
import AdminTaskList from '../components/AdminTaskList'
import AdminTaskEditForm from '../components/AdminTaskEditForm'
import AdminStepEditForm from '../components/AdminStepEditForm'
import AdminAnnouncementsPanel from '../components/AdminAnnouncementsPanel'
import { Shield, ShieldAlert } from 'lucide-react'

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
      <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] font-['Plus_Jakarta_Sans',sans-serif]">
        <Header />
        <main className="flex flex-col items-center justify-center px-4 py-20 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#FFF4F0] border border-[#FADCD1] text-[#C84B24] flex items-center justify-center shadow-2xs">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-[#1E293B]">
            Admin Privileges Required
          </h2>
          <p className="text-xs text-[#64748B] max-w-sm font-medium">
            You must be logged in as an administrator to access government process management functions.
          </p>
        </main>
      </div>
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Header */}
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6 py-8">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E6D8] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4F0] text-[#C84B24] border border-[#FADCD1] shadow-2xs">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif-title font-bold text-[#1E293B] tracking-tight">
                Government Process Admin Portal
              </h1>
              <p className="text-xs text-[#64748B] font-medium">
                Verify steps, manage statutory tasks, and update official requirements
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Task List Management Card */}
        <div className="rounded-2xl border border-[#E5D9C8] bg-white p-6 shadow-civic-sm space-y-4">
          <h3 className="text-base font-serif-title font-bold text-[#1E293B]">
            All Registered Tasks & Roadmaps
          </h3>
          <AdminTaskList tasks={tasks} onSelectTask={handleSelectTask} />
        </div>

        {selected && (
          <div className="flex flex-col gap-6 pt-2">
            <AdminTaskEditForm task={selected.task} onSave={handleSaveTask} />
            
            <div className="space-y-4">
              <h3 className="text-base font-serif-title font-bold text-[#1E293B]">
                Task Step Verification & Editing
              </h3>
              {selected.steps.map((step) => (
                <AdminStepEditForm
                  key={step._id}
                  step={{ ...step, stepId: step._id }}
                  onSave={handleSaveStep}
                  onVerify={handleVerifyStep}
                />
              ))}
            </div>
          </div>
        )}

        {/* Announcements Panel */}
        <AdminAnnouncementsPanel token={token} tasks={tasks} />
      </main>
    </div>
  )
}

export default AdminDashboardPage
