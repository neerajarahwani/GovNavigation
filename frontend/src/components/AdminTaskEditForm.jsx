import { useState, useEffect } from 'react'
import { Save, Tag, MapPin, FileText } from 'lucide-react'

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
    <div className="rounded-2xl border border-[#E5D9C8] bg-white p-6 shadow-civic-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[#F0E6D8] pb-3">
        <FileText className="h-4 w-4 text-[#C84B24]" />
        <h3 className="font-serif-title font-bold text-[#1E293B] text-base">
          Task Parameters & Metadata
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5">
            Process Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#C84B24]" />
              City Jurisdiction
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5 flex items-center gap-1">
              <Tag className="h-3 w-3 text-[#C84B24]" />
              Keywords (comma-separated)
            </label>
            <input
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="w-full rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs font-semibold text-red-600">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-fit flex items-center gap-1.5 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-4 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isSaving ? 'Saving Task...' : 'Save Task Metadata'}</span>
        </button>
      </div>
    </div>
  )
}

export default AdminTaskEditForm
