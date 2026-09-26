import { useState, useEffect, useCallback } from 'react'
import { queryTask, fetchTaskById } from '../api/tasksApi'
import { getTaskProgress, listProgress, markStep } from '../api/progressApi'
import { getAnnouncements } from '../api/announcementsApi'
import { useAuth } from '../context/AuthContext'
import TaskInputForm from '../components/TaskInputForm'
import RoadmapGraph from '../components/RoadmapGraph'
import StepDetailPanel from '../components/StepDetailPanel'
import SavedTasksList from '../components/SavedTasksList'
import AnnouncementBanner from '../components/AnnouncementBanner'
import Header from '../components/Header'

// Friendly messages for the response shapes the query/fetch endpoints can return —
// never show a raw error object to the citizen.
function messageForResponse(response) {
  if (response.status === 404) {
    return response.error || "We don't have information on this yet. Try describing it differently."
  }
  return 'Something went wrong — please wait a moment and try again.'
}

function TaskInputPage() {
  const { token, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedStep, setSelectedStep] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedStepIds, setCompletedStepIds] = useState([])
  const [savedTasks, setSavedTasks] = useState([])
  const [globalAnnouncements, setGlobalAnnouncements] = useState([])
  const [taskAnnouncements, setTaskAnnouncements] = useState([])

  // Global announcements are fetched once, on mount — same for every visitor.
  useEffect(() => {
    getAnnouncements().then((response) => {
      if (response.success) setGlobalAnnouncements(response.data)
    })
  }, [])

  const refreshSavedTasks = useCallback(async () => {
    if (!token) {
      setSavedTasks([])
      return
    }
    const response = await listProgress(token)
    if (response.success) setSavedTasks(response.data)
  }, [token])

  // Load the "your saved tasks" list whenever login state changes.
  useEffect(() => {
    refreshSavedTasks()
  }, [refreshSavedTasks])

  // Re-sync the open task's progress whenever login state changes — clears it on
  // logout (so another account's saved state doesn't linger), and fetches the
  // real saved progress if someone logs in while already viewing a task.
  useEffect(() => {
    if (!result) return
    if (!token) {
      setCompletedStepIds([])
      return
    }
    getTaskProgress(result.task.taskId, token).then((response) => {
      if (response.success) setCompletedStepIds(response.data.completedSteps)
    })
    // Only re-run when login state changes or a different task is opened — not on
    // every completedStepIds update, which would cause a refetch loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, result?.task?.taskId])

  async function loadTaskById(taskId) {
    const orderedResponse = await fetchTaskById(taskId)
    if (!orderedResponse.success) {
      setErrorMessage(messageForResponse(orderedResponse))
      return
    }
    setResult(orderedResponse.data)
    // Progress for this task is fetched by the effect below, keyed on
    // [token, taskId] — avoids fetching it twice here and there.

    // The backend returns global + task-specific together for a given taskId —
    // filter to task-specific only here, since the global ones are already
    // shown once, near the top of the page.
    const announcementsResponse = await getAnnouncements(taskId)
    const taskSpecific = announcementsResponse.success
      ? announcementsResponse.data.filter((a) => a.relatedTaskId)
      : []
    setTaskAnnouncements(taskSpecific)
  }

  async function handleSubmit({ text, city }) {
    setIsLoading(true)
    setErrorMessage('')
    setResult(null)
    setSelectedStep(null)

    try {
      const searchResponse = await queryTask({ text, city })
      if (!searchResponse.success) {
        setErrorMessage(messageForResponse(searchResponse))
        return
      }
      await loadTaskById(searchResponse.data.task.taskId)
    } catch {
      setErrorMessage('Could not reach the server — please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelectSavedTask(taskId) {
    setIsLoading(true)
    setErrorMessage('')
    setResult(null)
    setSelectedStep(null)
    try {
      await loadTaskById(taskId)
    } catch {
      setErrorMessage('Could not reach the server — please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleComplete(stepId, completed) {
    if (!token || !result) return

    // Update immediately so the checkbox/bar feel responsive, then confirm with the server.
    setCompletedStepIds((prev) =>
      completed ? [...prev, stepId] : prev.filter((id) => id !== stepId)
    )

    const response = await markStep({ taskId: result.task.taskId, stepId, completed }, token)
    if (response.success) {
      setCompletedStepIds(response.data.completedSteps)
      refreshSavedTasks()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-50 px-4 py-12">
      <Header />
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">CivicPath</h1>
        <p className="text-slate-500">Tell us what you need, in your own words.</p>
      </div>

      <AnnouncementBanner announcements={globalAnnouncements} />

      {user && <SavedTasksList tasks={savedTasks} onSelectTask={handleSelectSavedTask} />}

      <TaskInputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {errorMessage && (
        <p className="w-full max-w-xl rounded-md bg-amber-50 p-3 text-amber-800">
          {errorMessage}
        </p>
      )}

      {result && (
        <>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">{result.task.title}</h2>
            <p className="text-sm text-slate-500">{result.task.city}</p>
          </div>
          <AnnouncementBanner announcements={taskAnnouncements} />
          <RoadmapGraph
            steps={result.steps}
            onStepSelect={setSelectedStep}
            completedStepIds={completedStepIds}
          />
          <StepDetailPanel
            step={selectedStep}
            onClose={() => setSelectedStep(null)}
            isCompleted={selectedStep ? completedStepIds.includes(selectedStep.stepId) : false}
            onToggleComplete={handleToggleComplete}
          />
        </>
      )}
    </main>
  )
}

export default TaskInputPage
