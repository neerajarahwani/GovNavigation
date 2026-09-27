import { useState } from 'react'

// A single free-text search box — describe what you need in plain language,
// and the backend's Gemini extraction step figures out the service and city.
function TaskInputForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ text: text.trim() })
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

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}

export default TaskInputForm
