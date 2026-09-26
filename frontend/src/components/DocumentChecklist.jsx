import { useState, useMemo } from 'react'

// Collects every unique document mentioned across the task's steps and lets
// the citizen check off ones they already have — the parent page uses the
// checked set to filter the graph, this component only tracks the checkboxes.
function DocumentChecklist({ steps, onChange }) {
  const [checked, setChecked] = useState(new Set())

  const uniqueDocuments = useMemo(() => {
    const set = new Set()
    for (const step of steps) {
      for (const doc of step.documents || []) set.add(doc)
    }
    return Array.from(set)
  }, [steps])

  if (uniqueDocuments.length === 0) return null

  function toggle(doc) {
    const next = new Set(checked)
    if (next.has(doc)) next.delete(doc)
    else next.add(doc)
    setChecked(next)
    onChange(next)
  }

  return (
    <div className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-slate-700">
        Already have any of these? Check them off to skip that step.
      </p>
      <div className="flex flex-wrap gap-3">
        {uniqueDocuments.map((doc) => (
          <label key={doc} className="flex items-center gap-1 text-sm text-slate-700">
            <input type="checkbox" checked={checked.has(doc)} onChange={() => toggle(doc)} />
            {doc}
          </label>
        ))}
      </div>
    </div>
  )
}

export default DocumentChecklist
