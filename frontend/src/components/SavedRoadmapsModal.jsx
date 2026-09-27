import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import SavedTasksList from './SavedTasksList'

function SavedRoadmapsModal({ open, onClose, tasks = [], isLoading, onSelectTask, loggedIn }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E5D9C8] bg-white p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
          <h3 className="text-lg font-serif-title font-bold text-[#1E293B]">Your Saved Roadmaps</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#EBE1D3] text-[#64748B] hover:bg-[#F3EBE0] hover:text-[#1E293B] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!loggedIn ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-xs font-medium text-[#64748B]">
              Log in or sign up to save roadmaps and pick up where you left off.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] hover:bg-[#F3EBE0] px-4 py-2 text-xs font-bold text-[#1E293B] transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-4 py-2 text-xs font-bold text-white transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <p className="text-xs font-medium text-[#64748B] text-center py-6">Loading your saved roadmaps...</p>
        ) : tasks.length === 0 ? (
          <p className="text-xs font-medium text-[#64748B] text-center py-6">
            You haven't saved any roadmaps yet — search for a task and click "Save Roadmap."
          </p>
        ) : (
          <SavedTasksList
            tasks={tasks}
            onSelectTask={(taskId) => {
              onSelectTask(taskId)
              onClose()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SavedRoadmapsModal
