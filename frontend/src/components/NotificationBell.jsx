import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { getAnnouncements } from '../api/announcementsApi'

function NotificationBell({ taskId }) {
  const [open, setOpen] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    // With a taskId, the backend returns global announcements PLUS ones
    // specific to that task; without one, just global.
    getAnnouncements(taskId).then((res) => {
      if (!cancelled && res.success) setAnnouncements(res.data || [])
    })
    return () => {
      cancelled = true
    }
  }, [taskId])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5D9C8] bg-white hover:bg-[#FAF7F2] transition"
        title="Announcements"
      >
        <Bell className="h-4 w-4 text-[#1E293B]" />
        {announcements.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C84B24] px-1 text-[9px] font-bold text-white">
            {announcements.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 rounded-xl border border-[#E5D9C8] bg-white p-2 shadow-lg z-50 max-h-80 overflow-y-auto">
          <p className="px-2 py-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
            Announcements
          </p>
          {announcements.length === 0 ? (
            <p className="px-2 py-3 text-xs text-[#64748B] text-center">No announcements right now.</p>
          ) : (
            <div className="space-y-1">
              {announcements.map((a) => (
                <div key={a._id} className="rounded-lg px-2.5 py-2 hover:bg-[#FAF7F2] transition">
                  <p className="text-xs font-bold text-[#1E293B]">{a.title}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
