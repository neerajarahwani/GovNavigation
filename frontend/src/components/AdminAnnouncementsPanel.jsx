import { useState, useEffect, useCallback } from 'react'
import { listAll, create, update } from '../api/announcementsApi'

// Admin section: create form + list of every announcement with inline editing
// (including the isActive toggle).
function AdminAnnouncementsPanel({ token, tasks }) {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [relatedTaskId, setRelatedTaskId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const refresh = useCallback(async () => {
    const response = await listAll(token)
    if (response.success) setAnnouncements(response.data)
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(e) {
    e.preventDefault()
    setErrorMessage('')
    const response = await create(
      { title, body, relatedTaskId: relatedTaskId || null },
      token
    )
    if (response.success) {
      setTitle('')
      setBody('')
      setRelatedTaskId('')
      refresh()
    } else {
      setErrorMessage(response.error || 'Something went wrong.')
    }
  }

  async function handleToggleActive(announcement) {
    const response = await update(
      announcement._id,
      { isActive: !announcement.isActive },
      token
    )
    if (response.success) refresh()
  }

  return (
    <div className="mt-8 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-slate-900">Announcements</h2>

      <form onSubmit={handleCreate} className="mb-4 flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body"
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          required
        />
        <select
          value={relatedTaskId}
          onChange={(e) => setRelatedTaskId(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">General (shown everywhere)</option>
          {tasks.map((t) => (
            <option key={t.taskId} value={t.taskId}>
              {t.title}
            </option>
          ))}
        </select>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <button
          type="submit"
          className="w-fit rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          Post announcement
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {announcements.map((a) => (
          <li key={a._id} className="rounded-md border border-slate-200 p-3 text-sm">
            <p className="font-medium text-slate-900">{a.title}</p>
            <p className="text-slate-600">{a.body}</p>
            <p className="mt-1 text-xs text-slate-400">
              {a.relatedTaskId ? `Task-specific (${a.relatedTaskId})` : 'General'} ·{' '}
              {a.isActive ? 'Active' : 'Inactive'}
            </p>
            <button
              type="button"
              onClick={() => handleToggleActive(a)}
              className="mt-1 text-xs text-blue-600 underline"
            >
              {a.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminAnnouncementsPanel
