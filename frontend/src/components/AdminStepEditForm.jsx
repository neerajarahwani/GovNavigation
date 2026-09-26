import { useState, useEffect } from 'react'

// Editable step fields, plus a separate "Mark as verified" action — deliberately
// distinct from Save, since editing a field and personally verifying it are
// different claims (matches the backend contract's own separation).
function AdminStepEditForm({ step, onSave, onVerify }) {
  const [form, setForm] = useState(step)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    setForm(step)
    setErrorMessage('')
  }, [step])

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setIsSaving(true)
    setErrorMessage('')
    const response = await onSave(step.stepId, {
      name: form.name,
      department: form.department,
      fees: form.fees,
      estimatedDays: form.estimatedDays === '' ? null : Number(form.estimatedDays),
      eligibility: form.eligibility,
      sourceUrl: form.sourceUrl,
      documents: splitList(form.documents),
      prerequisites: splitList(form.prerequisites),
    })
    if (!response.success) setErrorMessage(response.error || 'Something went wrong.')
    setIsSaving(false)
  }

  async function handleVerify() {
    setIsVerifying(true)
    setErrorMessage('')
    const response = await onVerify(step.stepId)
    if (response.success) {
      setForm((prev) => ({ ...prev, confidenceScore: 1, lastVerified: response.data.lastVerified }))
    } else {
      setErrorMessage(response.error || 'Something went wrong.')
    }
    setIsVerifying(false)
  }

  const documentsText = Array.isArray(form.documents) ? form.documents.join(', ') : form.documents
  const prerequisitesText = Array.isArray(form.prerequisites)
    ? form.prerequisites.join(', ')
    : form.prerequisites

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h4 className="mb-3 font-semibold text-slate-900">{form.name}</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Name
          <input
            value={form.name || ''}
            onChange={(e) => setField('name', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Department
          <input
            value={form.department || ''}
            onChange={(e) => setField('department', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Fees
          <input
            value={form.fees || ''}
            onChange={(e) => setField('fees', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1">
          Estimated days
          <input
            type="number"
            value={form.estimatedDays ?? ''}
            onChange={(e) => setField('estimatedDays', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          Eligibility
          <input
            value={form.eligibility || ''}
            onChange={(e) => setField('eligibility', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          Documents (comma-separated)
          <input
            value={documentsText || ''}
            onChange={(e) => setField('documents', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          Prerequisites (comma-separated)
          <input
            value={prerequisitesText || ''}
            onChange={(e) => setField('prerequisites', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          Source URL
          <input
            value={form.sourceUrl || ''}
            onChange={(e) => setField('sourceUrl', e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1"
          />
        </label>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Depends on: {(step.dependsOn || []).length > 0 ? step.dependsOn.join(', ') : 'none'} —
        read-only here (edit via the backend if needed)
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Confidence: {form.confidenceScore} · Last verified:{' '}
        {form.lastVerified ? new Date(form.lastVerified).toLocaleString() : 'never'}
      </div>

      {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isVerifying ? 'Verifying…' : 'Mark as verified'}
        </button>
      </div>
    </div>
  )
}

function splitList(value) {
  if (Array.isArray(value)) return value
  return (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export default AdminStepEditForm
