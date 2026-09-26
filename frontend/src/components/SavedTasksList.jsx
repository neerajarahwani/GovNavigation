// Shown on the home page when logged in — lets a citizen jump straight back into
// a task they already started, instead of searching again.
function SavedTasksList({ tasks, onSelectTask }) {
  if (!tasks || tasks.length === 0) return null

  return (
    <div className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Your saved tasks</h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <li key={t.taskId}>
            <button
              type="button"
              onClick={() => onSelectTask(t.taskId)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{t.title}</span>
              <span className="text-slate-500"> — {t.city}</span>
              <span className="float-right text-slate-500">
                {t.completedCount}/{t.totalSteps} done
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SavedTasksList
