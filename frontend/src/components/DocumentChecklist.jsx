import { useState, useMemo } from 'react'
import { FileCheck, Check, Sparkles } from 'lucide-react'

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
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <FileCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Document Quick-Skip Checklist
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-600" /> Auto-optimizes graph
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Select documents you already possess to eliminate redundant steps from your roadmap.
            </p>
          </div>
        </div>
        {checked.size > 0 && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
            {checked.size} step(s) skipped
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5 pt-2">
        {skippableDocuments.map((doc) => {
          const isSelected = checked.has(doc)
          return (
            <button
              key={doc}
              type="button"
              onClick={() => toggle(doc)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>{doc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DocumentChecklist
