import { BookmarkCheck, ArrowRight, CheckCircle, Clock } from 'lucide-react'

function SavedTasksList({ tasks, onSelectTask }) {
  if (!tasks || tasks.length === 0) return null

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <BookmarkCheck className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 tracking-wide">Your Saved Roadmaps</h2>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tasks.map((t) => {
          const percent = t.totalSteps > 0 ? Math.round((t.completedCount / t.totalSteps) * 100) : 0
          return (
            <button
              key={t.taskId}
              type="button"
              onClick={() => onSelectTask(t.taskId)}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-left hover:border-indigo-400 hover:bg-white hover:shadow-md transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                    {t.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{t.city || 'National'}</p>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-semibold">
                  <span className="flex items-center gap-1">
                    {percent === 100 ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    {t.completedCount} of {t.totalSteps} steps
                  </span>
                  <span className={percent === 100 ? 'text-emerald-700 font-bold' : 'text-slate-800 font-bold'}>
                    {percent}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SavedTasksList
