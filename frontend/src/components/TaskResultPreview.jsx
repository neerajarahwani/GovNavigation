// Plain-list preview of a matched task — shown until the real roadmap graph
// feature replaces this with a proper visual picture.
function TaskResultPreview({ task, steps }) {
  return (
    <div className="w-full max-w-xl rounded-md border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
      <p className="mb-3 text-sm text-slate-500">{task.city}</p>
      <ol className="list-decimal space-y-2 pl-5">
        {steps.map((step) => (
          <li key={step.stepId} className="text-slate-800">
            <span className="font-medium">{step.name}</span>
            <span className="text-slate-500"> — {step.department}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default TaskResultPreview
