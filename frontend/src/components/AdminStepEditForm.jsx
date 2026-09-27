import { useState, useEffect } from 'react'
import { CheckCircle, Save, ShieldCheck, Clock, Building, DollarSign, Plus, X } from 'lucide-react'

// Must match backend's fixed tag list (backend/scripts/migrateDocumentTags.js).
const DOCUMENT_TAGS = [
  'Identity Proof',
  'Address Proof',
  'Date of Birth Proof',
  'Photograph',
  'Business/Registration Document',
  'Financial Document',
  'Acknowledgement/Receipt',
  'Other',
]

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
      documents: (form.documents || [])
        .filter((d) => d.name && d.name.trim())
        .map((d) => ({ name: d.name.trim(), tag: d.tag || 'Other' })),
      prerequisites: splitList(form.prerequisites),
    })
    if (!response.success) setErrorMessage(response.error || 'Something went wrong.')
    setIsSaving(false)
  }

  function setDocumentField(index, field, value) {
    setForm((prev) => {
      const documents = [...(prev.documents || [])]
      documents[index] = { ...documents[index], [field]: value }
      return { ...prev, documents }
    })
  }

  function addDocument() {
    setForm((prev) => ({ ...prev, documents: [...(prev.documents || []), { name: '', tag: 'Other' }] }))
  }

  function removeDocument(index) {
    setForm((prev) => ({ ...prev, documents: (prev.documents || []).filter((_, i) => i !== index) }))
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

  const documents = Array.isArray(form.documents) ? form.documents : []
  const prerequisitesText = Array.isArray(form.prerequisites)
    ? form.prerequisites.join(', ')
    : form.prerequisites

  return (
    <div className="rounded-2xl border border-[#E5D9C8] bg-white p-5 shadow-civic-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E6D8] pb-3">
        <h4 className="font-serif-title font-bold text-[#1E293B] text-base">
          {form.name}
        </h4>
        <div className="flex items-center gap-2">
          {form.confidenceScore === 1 ? (
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verified Step
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              Unverified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
            Step Name
          </label>
          <input
            value={form.name || ''}
            onChange={(e) => setField('name', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1 flex items-center gap-1">
            <Building className="h-3 w-3 text-[#C84B24]" />
            Department
          </label>
          <input
            value={form.department || ''}
            onChange={(e) => setField('department', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1 flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-[#C84B24]" />
            Fees
          </label>
          <input
            value={form.fees || ''}
            onChange={(e) => setField('fees', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#C84B24]" />
            Estimated Days
          </label>
          <input
            type="number"
            value={form.estimatedDays ?? ''}
            onChange={(e) => setField('estimatedDays', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
            Eligibility
          </label>
          <input
            value={form.eligibility || ''}
            onChange={(e) => setField('eligibility', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
            Required Documents
          </label>
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={doc.name || ''}
                onChange={(e) => setDocumentField(i, 'name', e.target.value)}
                placeholder="Document name"
                className="flex-1 rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
              />
              <select
                value={doc.tag || 'Other'}
                onChange={(e) => setDocumentField(i, 'tag', e.target.value)}
                className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-2 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:outline-none font-medium"
              >
                {DOCUMENT_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeDocument(i)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5D9C8] text-[#64748B] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                title="Remove document"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDocument}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#E5D9C8] px-3 py-1.5 text-[11px] font-bold text-[#C84B24] hover:bg-[#FFF4F0] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Document</span>
          </button>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
            Prerequisites (comma-separated)
          </label>
          <input
            value={prerequisitesText || ''}
            onChange={(e) => setField('prerequisites', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E293B] mb-1">
            Source URL
          </label>
          <input
            value={form.sourceUrl || ''}
            onChange={(e) => setField('sourceUrl', e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-2 focus:ring-[#C84B24]/10 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#F0E6D8] bg-[#FAF7F2] p-3 text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong>Depends on:</strong> {(step.dependsOn || []).length > 0 ? step.dependsOn.join(', ') : 'None'}
        </span>
        <span>
          <strong>Confidence:</strong> {form.confidenceScore} · <strong>Last verified:</strong>{' '}
          {form.lastVerified ? new Date(form.lastVerified).toLocaleString() : 'Never'}
        </span>
      </div>

      {errorMessage && <p className="text-xs font-semibold text-red-600">{errorMessage}</p>}

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>{isVerifying ? 'Verifying…' : 'Mark as Verified'}</span>
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
