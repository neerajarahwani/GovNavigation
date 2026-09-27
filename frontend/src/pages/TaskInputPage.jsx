import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import TaskInputForm from '../components/TaskInputForm'
import BusinessNavSidebar from '../components/BusinessNavSidebar'
import RoadmapGraph from '../components/RoadmapGraph'
import StepDetailPanel from '../components/StepDetailPanel'
import SidebarTabModal from '../components/SidebarTabModal'
import AnnouncementBanner from '../components/AnnouncementBanner'
import { queryTask } from '../api/tasksApi'
import { useAuth } from '../context/AuthContext'
import { getTaskProgress, markStep, setBookmark, setDocumentOwned } from '../api/progressApi'
import { getAnnouncements } from '../api/announcementsApi'

// A real task id is a Mongo ObjectId; the pre-search placeholder roadmap
// below uses a fake one, so actions that hit the backend (bookmark, mark
// complete, document ownership) are only offered once a real task is loaded.
function isRealTaskId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
}


// Default Business Registration roadmap data matching reference image
const DEFAULT_BUSINESS_ROADMAP = {
  taskId: 'biz-reg-mh',
  name: 'Business Registration',
  city: 'Maharashtra',
  forms: [],
  feeBreakdown: [],
  departments: [],
  steps: [
    {
      stepId: 's1',
      name: '1. Check Eligibility',
      subtitle: 'Understand if you meet the basic requirements',
      description:
        'Understand if you meet the basic age, residency, business type, and initial capital requirements.',
      keyPoints: [
        'Verify age, nationality, and residency criteria',
        'Ensure proposed business activity is legally permitted in Maharashtra',
        'Determine appropriate ownership model (Sole Proprietor, LLP, Pvt Ltd)',
      ],
      documents: ['PAN Card', 'Aadhaar Card'],
      department: 'Department of Industries, Maharashtra',
      govtTag: 'Government of Maharashtra',
      sourceTitle: 'Maharashtra Industry Directorate',
      sourceUrl: 'https://di.maharashtra.gov.in/',
    },
    {
      stepId: 's2',
      name: '2. Choose Business Structure',
      subtitle: 'Sole Proprietorship, Partnership, LLP, Pvt Ltd, etc.',
      description:
        'Decide the legal structure for your business based on your goals, liability, and investment.',
      keyPoints: [
        'Common options: Sole Proprietorship, Partnership, LLP, Private Limited Company',
        'Consider liability, taxation, and compliance requirements',
        'Some business types may require prior approval',
        'You can also register under Udyam for MSME benefits',
      ],
      documents: [
        'PAN card (individual or entity)',
        'Identity proof (Aadhaar, Passport, etc.)',
        'Address proof (rental agreement, utility bill, etc.)',
      ],
      department: 'Ministry of Corporate Affairs (MCA)',
      govtTag: 'Government of India',
      sourceTitle: 'MCA - Types of Business Structures',
      sourceUrl: 'https://www.mca.gov.in/',
    },
    {
      stepId: 's3',
      name: '3. Prepare Required Documents',
      subtitle: 'PAN, Address Proof, Identity Proof, etc.',
      description:
        'Gather and attest all mandatory identity, address, and premises ownership documentation.',
      keyPoints: [
        'Attest copies of identity and address proofs',
        'Obtain landlord NOC for commercial or home office business address',
        'Prepare Memorandum & Articles of Association if forming Pvt Ltd',
      ],
      documents: ['PAN Card', 'Aadhaar Card', 'Utility Bill', 'Owner NOC'],
      department: 'Income Tax Department & Local Registrar',
      govtTag: 'Government of India',
      sourceTitle: 'Income Tax Department Portal',
      sourceUrl: 'https://www.incometax.gov.in/',
    },
    {
      stepId: 's4',
      name: '4. Register with MCA / Udyam (if applicable)',
      subtitle: 'Apply for incorporation or Udyam registration',
      description:
        'Submit incorporation forms on SPICe+ MCA portal or register under MSME Udyam.',
      keyPoints: [
        'Apply for SPICe+ integrated form on MCA portal for Private Limited',
        'Register on Udyam portal for zero-cost MSME government benefits',
        'Receive official Certificate of Incorporation and Udyam Registration Certificate',
      ],
      documents: ['Digital Signature (DSC)', 'DIN of Directors', 'MOA & AOA'],
      department: 'Ministry of Corporate Affairs / MSME Ministry',
      govtTag: 'Government of India',
      sourceTitle: 'Udyam Registration Portal',
      sourceUrl: 'https://udyamregistration.gov.in/',
    },
    {
      stepId: 's5',
      name: '5. Obtain PAN & TAN',
      subtitle: 'For your business entity',
      description:
        'Apply for Tax Deduction Account Number (TAN) and Permanent Account Number (PAN) for tax filing.',
      keyPoints: [
        'Apply online through NSDL / PROTEAN portal',
        'Mandatory for opening entity current bank account',
        'TAN is mandatory for deducting Tax Deducted at Source (TDS)',
      ],
      documents: ['Certificate of Incorporation', 'Entity Proof'],
      department: 'Income Tax Department',
      govtTag: 'Government of India',
      sourceTitle: 'Protean NSDL e-Gov Portal',
      sourceUrl: 'https://www.tin-nsdl.com/',
    },
    {
      stepId: 's6',
      name: '6. Apply for GST Registration',
      subtitle: 'If applicable',
      description:
        'Register under Goods & Services Tax (GST) for commercial invoices and inter-state trade.',
      keyPoints: [
        'Mandatory if turnover exceeds ₹20 Lakhs / ₹40 Lakhs threshold',
        'Required for e-commerce selling and inter-state operations',
        'Receive 15-digit GSTIN upon GST officer verification',
      ],
      documents: ['PAN Card', 'Business Address Proof', 'Cancelled Cheque'],
      department: 'Goods and Services Tax Network (GSTN)',
      govtTag: 'Government of India',
      sourceTitle: 'Official GST Portal India',
      sourceUrl: 'https://www.gst.gov.in/',
    },
    {
      stepId: 's7',
      name: '7. Apply for Shop and Establishment License',
      subtitle: 'Through Maharashtra Labour Department',
      description:
        'Obtain Shop & Establishment registration under Maharashtra Shops and Establishments Act.',
      keyPoints: [
        'Mandatory for all commercial establishments operating in Maharashtra',
        'Apply on Aaple Sarkar portal within 30 days of starting',
        'Instant Intimation Receipt (Form F) issued for small establishments',
      ],
      documents: ['Shop Photo with Name Board', 'Rent Agreement', 'Aadhaar'],
      department: 'Maharashtra Labour Department',
      govtTag: 'Government of Maharashtra',
      sourceTitle: 'Aaple Sarkar Maharashtra Portal',
      sourceUrl: 'https://aaplesarkar.mahaonline.gov.in/',
    },
    {
      stepId: 's8',
      name: '8. Start Operations',
      subtitle: "You're all set!",
      description:
        'Open entity current bank account and commence commercial operations in compliance with state laws.',
      keyPoints: [
        'Open business current bank account using incorporated documents',
        'Commence commercial operations safely',
        'Maintain statutory registers and file periodic tax returns',
      ],
      documents: ['All Issued Licenses', 'Bank Account Details'],
      department: 'State & Central Compliance Authorities',
      govtTag: 'Government of Maharashtra & India',
      sourceTitle: 'Maharashtra Industrial Development Corporation',
      sourceUrl: 'https://www.midcindia.org/',
    },
  ],
}
function TaskInputPage() {
  const { user, token } = useAuth()
  const [taskData, setTaskData] = useState(DEFAULT_BUSINESS_ROADMAP)
  const [selectedStep, setSelectedStep] = useState(DEFAULT_BUSINESS_ROADMAP.steps[1]) // Step 2 selected by default
  const [completedStepIds, setCompletedStepIds] = useState(['s1']) // Step 1 completed by default (25% progress = 2 of 8)
  const [ownedDocuments, setOwnedDocuments] = useState([])
  const [bookmarked, setBookmarked] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saveToast, setSaveToast] = useState(false)
  const [authPrompt, setAuthPrompt] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState(null)

  const isRealTask = isRealTaskId(taskData.taskId)

  // Handle Form Submission
  async function handleFormSubmit({ text, city }) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await queryTask({ text, city })
      if (res.success && res.data && res.data.steps && res.data.steps.length > 0) {
        const formattedTask = {
          taskId: res.data.task.taskId,
          name: res.data.task.title || text,
          city: res.data.task.city || city || '',
          forms: res.data.task.forms || [],
          feeBreakdown: res.data.task.feeBreakdown || [],
          departments: res.data.task.departments || [],
          steps: res.data.steps.map((s, idx) => ({
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
            fees: s.fees,
            estimatedDays: s.estimatedDays,
            eligibility: s.eligibility,
            dependsOn: s.dependsOn || [],
            canRunParallelWith: s.canRunParallelWith || [],
          })),
        }
        setTaskData(formattedTask)
        setSelectedStep(formattedTask.steps[0])
        setCompletedStepIds([])
        setOwnedDocuments([])
        setBookmarked(false)

        // Load the logged-in user's real saved progress for this task.
        if (token && isRealTaskId(formattedTask.taskId)) {
          const progressRes = await getTaskProgress(formattedTask.taskId, token)
          if (progressRes.success) {
            setCompletedStepIds(progressRes.data.completedSteps || [])
            setOwnedDocuments(progressRes.data.ownedDocuments || [])
            setBookmarked(!!progressRes.data.bookmarked)
          }
        }

        // Load any active announcements for this task.
        const announcementsRes = await getAnnouncements(formattedTask.taskId)
        if (announcementsRes.success) {
          setAnnouncements(announcementsRes.data || [])
        } else {
          setAnnouncements([])
        }
      } else {
        setError(res.error || "We don't have information on this yet. Try describing it differently.")
      }
    } catch (err) {
      setError('Could not reach the server right now — please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Save Roadmap Action
  async function handleSaveRoadmap() {
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }
    if (!isRealTask) return

    const nextBookmarked = !bookmarked
    const res = await setBookmark(taskData.taskId, nextBookmarked, token)
    if (res.success) {
      setBookmarked(nextBookmarked)
      setSaveToast(true)
      setTimeout(() => setSaveToast(false), 3000)
    }
  }

  // Handle marking a step complete/incomplete
  async function handleToggleStepComplete(stepId, completed) {
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }
    if (!isRealTask) return

    const res = await markStep({ taskId: taskData.taskId, stepId, completed }, token)
    if (res.success) {
      setCompletedStepIds(res.data.completedSteps || [])
    }
  }

  // Handle checking/unchecking a document as already-owned
  async function handleToggleDocumentOwned(documentName, owned) {
    if (!token) {
      setAuthPrompt(true)
      setTimeout(() => setAuthPrompt(false), 4000)
      return
    }
    if (!isRealTask) return

    const res = await setDocumentOwned(taskData.taskId, documentName, owned, token)
    if (res.success) {
      setOwnedDocuments(res.data.ownedDocuments || [])
    }
  }

  // Navigation helpers for Right Sidebar Step Detail Panel
  const currentStepIndex = taskData.steps.findIndex(
    (s) => s.stepId === selectedStep?.stepId
  )
  const activeStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 2

  function handlePrevStep() {
    if (currentStepIndex > 0) {
      setSelectedStep(taskData.steps[currentStepIndex - 1])
    }
  }

  function handleNextStep() {
    if (currentStepIndex < taskData.steps.length - 1) {
      setSelectedStep(taskData.steps[currentStepIndex + 1])
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Top Bar */}
      <Header activeTab={activeModalTab || 'home'} onTabChange={setActiveModalTab} />

      {/* Main Container */}
      <main className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 pt-6 pb-20">
        {/* Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#1E293B] text-white px-4 py-3 text-xs font-bold shadow-xl animate-bounce">
            <span>✓ Roadmap saved to your profile!</span>
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
          steps={taskData.steps}
          taskTitle={taskData.name}
          cityName={taskData.city}
          forms={taskData.forms || []}
          feeBreakdown={taskData.feeBreakdown || []}
          departments={taskData.departments || []}
          ownedDocuments={ownedDocuments}
          onToggleDocumentOwned={handleToggleDocumentOwned}
        />

        {/* Hero Search Section */}
        <TaskInputForm
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          currentQuery={taskData.name}
          currentCity={taskData.city}
        />

        {/* Announcements for this task */}
        {announcements.map((a) => (
          <AnnouncementBanner key={a._id} text={a.body} />
        ))}

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 text-center">
            {error}
          </div>
        )}

        {/* 3-Column Main Content Grid Layout */}
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
              step={selectedStep || taskData.steps[1]}
              stepIndex={activeStepNumber}
              totalSteps={taskData.steps.length}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              isCompleted={selectedStep ? completedStepIds.includes(selectedStep.stepId) : false}
              onToggleComplete={
                isRealTask ? (completed) => handleToggleStepComplete(selectedStep.stepId, completed) : undefined
              }
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#EAE0D0] bg-[#FAF7F2] py-6 text-center text-xs font-medium text-[#786E64]">
        <p>CivicPath © 2026 — Your Guide to Government Services in India.</p>
      </footer>
    </div>
  )
}

export default TaskInputPage
