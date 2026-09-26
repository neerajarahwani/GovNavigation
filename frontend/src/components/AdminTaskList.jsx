// Shows every task with how many of its steps still need checking. Clicking a
// row loads that task's full detail.
function AdminTaskList({ tasks, onSelectTask }) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-slate-500">No tasks found.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((t) => (
        <li key={t.taskId}>
          <button
            type="button"
            onClick={() => onSelectTask(t.taskId)}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
          >
            <span className="font-medium text-slate-900">{t.title}</span>
            <span className="text-slate-500"> — {t.city}</span>
            <span className="float-right text-sm text-amber-700">
              {t.unverifiedSteps} of {t.totalSteps} steps unverified
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default AdminTaskList
