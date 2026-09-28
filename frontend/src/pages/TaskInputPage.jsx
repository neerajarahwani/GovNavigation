import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Header from '../components/Header'
import TaskInputForm from '../components/TaskInputForm'
import BusinessNavSidebar from '../components/BusinessNavSidebar'
import RoadmapGraph from '../components/RoadmapGraph'
import StepDetailPanel from '../components/StepDetailPanel'
import SidebarTabModal from '../components/SidebarTabModal'
import SavedRoadmapsModal from '../components/SavedRoadmapsModal'
import { queryTask, fetchTaskById } from '../api/tasksApi'
import { useAuth } from '../context/AuthContext'
import { getTaskProgress, listProgress, markStep, setBookmark, setDocumentOwned } from '../api/progressApi'

// A real task id is a Mongo ObjectId; the pre-search placeholder roadmap
// below uses a fake one, so actions that hit the backend (bookmark, mark
// complete, document ownership) are only offered once a real task is loaded.
function isRealTaskId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
}


// Shapes a /api/tasks/query or /api/tasks/:taskId response into the shape
// this page's components expect. Shared by a fresh search and by opening a
// previously saved roadmap, since both endpoints return the same {task,
// steps} shape.
function formatTaskData(data, fallbackText, fallbackCity) {
  return {
    taskId: data.task.taskId,
    name: data.task.title || fallbackText || '',
    city: data.task.city || fallbackCity || '',
    forms: data.task.forms || [],
    feeBreakdown: data.task.feeBreakdown || [],
    departments: data.task.departments || [],
    steps: data.steps.map((s, idx) => ({
      stepId: s.stepId,
      name: s.name.match(/^\d+\./) ? s.name : `${idx + 1}. ${s.name}`,
      subtitle: s.subtitle || s.department || 'Government requirement',
      description: s.description || s.name,
      keyPoints: s.keyPoints && s.keyPoints.length > 0 ? s.keyPoints : s.prerequisites || [],
      documents: s.documents || [],
      department: s.department || 'Concerned Authority',
      govtTag: s.govtTag || '',
      sourceTitle: s.sourceTitle || `${s.department || 'Official'} Portal`,
      sourceUrl: s.sourceUrl,
      lastVerified: s.lastVerified,
      fees: s.fees,
      estimatedDays: s.estimatedDays,
      eligibility: s.eligibility,
      dependsOn: s.dependsOn || [],
      canRunParallelWith: s.canRunParallelWith || [],
    })),
  }
}

function TaskInputPage() {
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [taskData, setTaskData] = useState(null)
  const [selectedStep, setSelectedStep] = useState(null)
  const [completedStepIds, setCompletedStepIds] = useState([])
  const [ownedDocuments, setOwnedDocuments] = useState([])
  const [bookmarked, setBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saveToast, setSaveToast] = useState(null)
  const [authPrompt, setAuthPrompt] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState(null)
  const [savedRoadmapsOpen, setSavedRoadmapsOpen] = useState(false)
  const [savedTasks, setSavedTasks] = useState([])
  const [savedRoadmapsLoading, setSavedRoadmapsLoading] = useState(false)

  const isRealTask = !!taskData && isRealTaskId(taskData.taskId)

  // Header's My Roadmaps/Saved/Help buttons, when clicked from a different
  // page (Login, Signup, Admin), navigate here with { openTab } in route
  // state since there's no in-page modal handler on those pages. Open that
  // tab once, then clear the state so it doesn't reopen on a later visit.
  useEffect(() => {
    const openTab = location.state?.openTab
    if (openTab) {
      handleHeaderTabChange(openTab)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  // Applies a formatted task to page state and loads the logged-in user's
  // saved progress for it. Shared by a fresh search and by opening a
  // previously saved roadmap. Announcements for this task show up in the
  // navbar's notification bell (see Header's taskId prop below).
  async function applyTaskData(formattedTask) {
    setTaskData(formattedTask)
    setSelectedStep(formattedTask.steps[0])
    setCompletedStepIds([])
    setOwnedDocuments([])
    setBookmarked(false)

    if (token && isRealTaskId(formattedTask.taskId)) {
      const progressRes = await getTaskProgress(formattedTask.taskId, token)
      if (progressRes.success) {
        setCompletedStepIds(progressRes.data.completedSteps || [])
        setOwnedDocuments(progressRes.data.ownedDocuments || [])
        setBookmarked(!!progressRes.data.bookmarked)
      }
    }
  }

  // Handle Form Submission
  async function handleFormSubmit({ text, city }) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await queryTask({ text, city })
      if (res.success && res.data && res.data.steps && res.data.steps.length > 0) {
        await applyTaskData(formatTaskData(res.data, text, city))
      } else {
        setError(res.error || "We don't have information on this yet. Try describing it differently.")
      }
    } catch (err) {
      setError('Could not reach the server right now — please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle opening a previously saved roadmap from the "My Roadmaps" modal.
  async function handleSelectSavedTask(taskId) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetchTaskById(taskId)
      if (res.success && res.data && res.data.steps) {
        await applyTaskData(formatTaskData(res.data))
      } else {
        setError(res.error || 'Could not load that saved roadmap.')
      }
    } catch (err) {
      setError('Could not reach the server right now — please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle opening the "My Roadmaps" / "Saved" modal
  async function handleOpenSavedRoadmaps() {
    setSavedRoadmapsOpen(true)
    if (!token) return

    setSavedRoadmapsLoading(true)
    const res = await listProgress(token)
    setSavedTasks(res.success ? (res.data || []).filter((t) => t.bookmarked) : [])
    setSavedRoadmapsLoading(false)
  }

  // Routes Header's nav clicks: Home just closes any open modal, Saved
  // opens the saved-roadmaps modal, everything else (Help) goes to the
  // normal task-detail modal.
  function handleHeaderTabChange(tab) {
    if (tab === 'home') {
      setActiveModalTab(null)
      return
    }
    if (tab === 'Saved') {
      setActiveModalTab(tab)
      handleOpenSavedRoadmaps()
      return
    }
    setActiveModalTab(tab)
  }

  function showNoTaskNotice() {
    setSaveToast('Search for a task first to use this feature.')
    setTimeout(() => setSaveToast(null), 3000)
  }

  // Handle Save Roadmap Action
  async function handleSaveRoadmap() {
    if (!isRealTask) {
      showNoTaskNotice()
      return
    }
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }

    const nextBookmarked = !bookmarked
    const res = await setBookmark(taskData.taskId, nextBookmarked, token)
    if (res.success) {
      setBookmarked(nextBookmarked)
      setSaveToast(nextBookmarked ? '✓ Roadmap saved to your profile!' : 'Roadmap removed from your saved list.')
      setTimeout(() => setSaveToast(null), 3000)
    }
  }

  // Handle marking a step complete/incomplete
  async function handleToggleStepComplete(stepId, completed) {
    if (!isRealTask) {
      showNoTaskNotice()
      return
    }
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }

    const res = await markStep({ taskId: taskData.taskId, stepId, completed }, token)
    if (res.success) {
      setCompletedStepIds(res.data.completedSteps || [])
    }
  }

  // Handle checking/unchecking a document as already-owned
  async function handleToggleDocumentOwned(documentName, owned) {
    if (!isRealTask) {
      showNoTaskNotice()
      return
    }
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }

    const res = await setDocumentOwned(taskData.taskId, documentName, owned, token)
    if (res.success) {
      setOwnedDocuments(res.data.ownedDocuments || [])
    }
  }

  // Navigation helpers for Right Sidebar Step Detail Panel
  const currentStepIndex = taskData ? taskData.steps.findIndex((s) => s.stepId === selectedStep?.stepId) : -1
  const activeStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 1

  function handlePrevStep() {
    if (currentStepIndex > 0) {
      setSelectedStep(taskData.steps[currentStepIndex - 1])
    }
  }

  function handleNextStep() {
    if (taskData && currentStepIndex < taskData.steps.length - 1) {
      setSelectedStep(taskData.steps[currentStepIndex + 1])
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Top Bar */}
      <Header
        activeTab={activeModalTab || 'home'}
        onTabChange={handleHeaderTabChange}
        taskId={isRealTask ? taskData.taskId : undefined}
      />

      {/* Hero Search Section — full width, flush against the header, not
          constrained by <main>'s max-w-7xl/padding */}
      <TaskInputForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        currentQuery={taskData?.name || ''}
        currentCity={taskData?.city || ''}
      />

      {/* Main Container */}
      <main className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 sm:px-6 pt-5 pb-10">
        {/* Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#1E293B] text-white px-4 py-3 text-xs font-bold shadow-xl animate-bounce">
            <span>{saveToast}</span>
          </div>
        )}

        {/* Login Prompt Toast */}
        {authPrompt && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[#1E293B] text-white px-4 py-3 text-xs font-bold shadow-xl">
            <span>Log in to save your progress.</span>
            <Link to="/login" className="rounded-lg bg-[#C84B24] px-2.5 py-1 hover:bg-[#AF3C19] transition">
              Log In
            </Link>
          </div>
        )}

        {/* Sidebar Interactive Tab Modal */}
        <SidebarTabModal
          activeTab={activeModalTab}
          onClose={() => setActiveModalTab(null)}
          steps={taskData?.steps || []}
          taskTitle={taskData?.name}
          cityName={taskData?.city}
          forms={taskData?.forms || []}
          feeBreakdown={taskData?.feeBreakdown || []}
          departments={taskData?.departments || []}
          ownedDocuments={ownedDocuments}
          onToggleDocumentOwned={handleToggleDocumentOwned}
        />

        {/* Saved Roadmaps Modal */}
        <SavedRoadmapsModal
          open={savedRoadmapsOpen}
          onClose={() => {
            setSavedRoadmapsOpen(false)
            setActiveModalTab(null)
          }}
          tasks={savedTasks}
          isLoading={savedRoadmapsLoading}
          onSelectTask={handleSelectSavedTask}
          loggedIn={!!token}
        />

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Empty state — shown until a real search loads a task */}
        {!taskData && !isLoading && (
          <div className="w-full max-w-xl flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E5D9C8] bg-white/60 py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4F0] border border-[#FADCD1] text-[#C84B24]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B]">No roadmap loaded yet</h3>
            <p className="text-xs text-[#64748B] font-medium max-w-sm">
              Search for a government task above (e.g. "apply for a passport") to see its step-by-step roadmap here.
            </p>
          </div>
        )}

        {/* 3-Column Main Content Grid Layout */}
        {taskData && (
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* COLUMN 1: Left Navigation & Progress Sidebar (3 Cols) */}
            <div className="lg:col-span-3 w-full">
              <BusinessNavSidebar
                title={taskData.name}
                stateName={taskData.city}
                completedCount={completedStepIds.length}
                totalCount={taskData.steps.length}
                activeTab={activeModalTab || 'Roadmap'}
                onTabChange={setActiveModalTab}
                onSaveRoadmap={handleSaveRoadmap}
                bookmarked={bookmarked}
                steps={taskData.steps}
              />
            </div>

            {/* COLUMN 2: Middle Roadmap Flowchart View (5 Cols) */}
            <div className="lg:col-span-5 w-full">
              <RoadmapGraph
                steps={taskData.steps}
                onStepSelect={setSelectedStep}
                selectedStepId={selectedStep?.stepId}
                completedStepIds={completedStepIds}
                taskTitle={taskData.name}
                cityName={taskData.city}
              />
            </div>

            {/* COLUMN 3: Right Step Detail Panel (4 Cols) */}
            <div className="lg:col-span-4 w-full sticky top-20">
              <StepDetailPanel
                step={selectedStep || taskData.steps[0]}
                stepIndex={activeStepNumber}
                totalSteps={taskData.steps.length}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                isCompleted={selectedStep ? completedStepIds.includes(selectedStep.stepId) : false}
                onToggleComplete={
                  isRealTask ? (completed) => handleToggleStepComplete(selectedStep.stepId, completed) : undefined
                }
                cityName={taskData?.city}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#EAE0D0] bg-[#FAF7F2] py-6 text-center text-xs font-medium text-[#786E64]">
        <p>JanDisha © 2026 — Your Guide to Government Services in India.</p>
      </footer>
    </div>
  )
}

export default TaskInputPage
