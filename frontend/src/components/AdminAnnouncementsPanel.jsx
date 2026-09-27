import { useState, useEffect, useCallback } from 'react'
import { listAll, create, update } from '../api/announcementsApi'
import { Megaphone, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

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
    <div className="rounded-2xl border border-[#E5D9C8] bg-white p-6 shadow-civic-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-[#F0E6D8] pb-3">
        <Megaphone className="h-5 w-5 text-[#C84B24]" />
        <h3 className="font-serif-title font-bold text-[#1E293B] text-base">
          Government & Portal Broadcast Announcements
        </h3>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement Title (e.g. Maharashtra GST Portal Maintenance)"
          className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details or directive notice..."
          className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition h-20"
          required
        />
        <select
          value={relatedTaskId}
          onChange={(e) => setRelatedTaskId(e.target.value)}
          className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] px-3.5 py-2 text-xs text-[#1E293B] focus:bg-white focus:border-[#C84B24] focus:ring-4 focus:ring-[#C84B24]/10 focus:outline-none font-medium transition"
        >
          <option value="">General (Broadcast to all portal visitors)</option>
          {tasks.map((t) => (
            <option key={t.taskId} value={t.taskId}>
              Task Specific: {t.title}
            </option>
          ))}
        </select>

        {errorMessage && <p className="text-xs font-semibold text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          className="w-fit flex items-center gap-1.5 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Post Broadcast Notice</span>
        </button>
      </form>

      <div className="space-y-2 pt-2 border-t border-[#F0E6D8]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
          Active Broadcasts ({announcements.length})
        </h4>
        <ul className="flex flex-col gap-2.5">
          {announcements.length === 0 ? (
            <p className="text-xs text-[#64748B]">No announcements posted yet.</p>
          ) : (
            announcements.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] p-3.5 text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#1E293B]">{a.title}</span>
                  <p className="text-[#64748B] text-[11px] font-medium">{a.body}</p>
                  <span className="mt-1 text-[10px] font-bold text-[#8C5815] bg-[#FFF8EC] border border-[#F5E6CD] w-fit px-2 py-0.5 rounded-md">
                    {a.relatedTaskId ? `Task: ${a.relatedTaskId}` : 'Global Broadcast'} ·{' '}
                    {a.isActive ? 'Status: Active' : 'Status: Inactive'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(a)}
                  className={`shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                    a.isActive
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border border-[#E5D9C8] bg-[#FAF7F2] text-[#64748B] hover:bg-[#F0E6D8]'
                  }`}
                >
                  {a.isActive ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-[#94A3B8]" />}
                  <span>{a.isActive ? 'Active' : 'Inactive'}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default AdminAnnouncementsPanel
