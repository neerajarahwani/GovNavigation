import { MapPin, AlertCircle } from 'lucide-react'

// Shows every task with how many of its steps still need checking.
function AdminTaskList({ tasks, onSelectTask }) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-xs font-semibold text-[#64748B]">No tasks registered yet.</p>
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {tasks.map((t) => (
        <li key={t.taskId}>
          <button
            type="button"
            onClick={() => onSelectTask(t.taskId)}
            className="w-full flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-4 py-3.5 text-left hover:border-[#C84B24] hover:bg-white hover:shadow-2xs transition group"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-xs text-[#1E293B] group-hover:text-[#C84B24] transition">
                {t.title}
              </span>
              <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#C84B24]" />
                {t.city}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 rounded-lg border border-[#F5E6CD] bg-[#FFF8EC] px-2.5 py-1 text-[11px] font-bold text-[#8C5815]">
              <AlertCircle className="h-3.5 w-3.5 text-[#D97706]" />
              <span>
                {t.unverifiedSteps} of {t.totalSteps} steps unverified
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default AdminTaskList
