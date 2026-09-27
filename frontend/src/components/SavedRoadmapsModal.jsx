import { X } from 'lucide-react'
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
          <p className="text-xs font-medium text-[#64748B] text-center py-6">
            Log in to see roadmaps you've saved.
          </p>
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
