import { useState, useMemo } from 'react'

// Only documents that actually match some step's name are shown here —
// checking anything else would do nothing, and give no clue why. This keeps
// the promise "check it off to skip that step" always true for whatever is
// shown.
function findSkippableDocuments(steps) {
  const set = new Set()
  for (const step of steps) {
    for (const doc of step.documents || []) {
      const matchesAStep = steps.some((s) => s.name.toLowerCase().includes(doc.toLowerCase()))
      if (matchesAStep) set.add(doc)
    }
  }
  return Array.from(set)
}

function DocumentChecklist({ steps, onChange }) {
  const [checked, setChecked] = useState(new Set())

  const skippableDocuments = useMemo(() => findSkippableDocuments(steps), [steps])

  if (skippableDocuments.length === 0) return null

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
        {skippableDocuments.map((doc) => (
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
