import { useState, useEffect } from 'react'

// Editable title/city/keywords for a task. Keywords are entered as
// comma-separated text and split into an array on save — simple, good enough
// for a hackathon admin tool.
function AdminTaskEditForm({ task, onSave }) {
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [keywordsText, setKeywordsText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(task.title)
    setCity(task.city)
    setKeywordsText((task.keywords || []).join(', '))
    setErrorMessage('')
  }, [task])

  async function handleSave() {
    setIsSaving(true)
    setErrorMessage('')
    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    const response = await onSave({ title, city, keywords })
    if (!response.success) setErrorMessage(response.error || 'Something went wrong.')
    setIsSaving(false)
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-slate-900">Task details</h3>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          City
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Keywords (comma-separated)
          <input
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save task'}
        </button>
      </div>
    </div>
  )
}

export default AdminTaskEditForm
