import { useState } from 'react'

const SERVICE_OPTIONS = [
  { label: 'Business registration', value: 'business registration' },
  { label: 'Birth certificate', value: 'birth certificate' },
]

const CITY_OPTIONS = ['Mumbai']

// The search box plus the dropdown fallback. Typed text wins over the dropdowns if
// both are filled, matching the backend's own behavior.
function TaskInputForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('')
  const [service, setService] = useState('')
  const [city, setCity] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const finalText = text.trim() || service
    onSubmit({ text: finalText, city })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">
          What do you need help with?
        </span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I want to register a small business in Mumbai"
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        or pick from the list
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="flex gap-3">
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="">Select a service (optional)</option>
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="">Select a city (optional)</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || (!text.trim() && !service)}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}

export default TaskInputForm
