import { useState, useEffect, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { getAnnouncements, markAnnouncementsRead } from '../api/announcementsApi'
import { useAuth } from '../context/AuthContext'

function NotificationBell({ taskId }) {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    // With a taskId, the backend returns global announcements PLUS ones
    // specific to that task; without one, just global. Sending the token (when
    // logged in) gets each announcement's isRead for this specific user.
    getAnnouncements(taskId, token).then((res) => {
      if (!cancelled && res.success) setAnnouncements(res.data || [])
    })
    return () => {
      cancelled = true
    }
  }, [taskId, token])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const unreadCount = announcements.filter((a) => !a.isRead).length

  function handleToggle() {
    const nextOpen = !open
    setOpen(nextOpen)

    // Opening the dropdown counts as "read" — mark any currently-unread ones
    // so they stop counting toward this user's badge from now on (including
    // on future logins).
    if (nextOpen && token) {
      const unreadIds = announcements.filter((a) => !a.isRead).map((a) => a._id)
      if (unreadIds.length > 0) {
        markAnnouncementsRead(unreadIds, token)
        setAnnouncements((prev) => prev.map((a) => (unreadIds.includes(a._id) ? { ...a, isRead: true } : a)))
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5D9C8] bg-white hover:bg-[#FAF7F2] transition"
        title="Announcements"
      >
        <Bell className="h-4 w-4 text-[#1E293B]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C84B24] px-1 text-[9px] font-bold text-white">
            {unreadCount}
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
                <div key={a._id} className="flex items-start gap-2 rounded-lg px-2.5 py-2 hover:bg-[#FAF7F2] transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1E293B]">{a.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{a.body}</p>
                  </div>
                  {a.isRead ? (
                    <span title="Read" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E7F5EC] text-[#1E8E4B]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : (
                    <span title="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C84B24]" />
                  )}
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
