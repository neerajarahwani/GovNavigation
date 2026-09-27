import { Bell } from 'lucide-react'

function AnnouncementBanner({ text }) {
  if (!text) return null

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-md shadow-amber-500/5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300">
          <Bell className="h-4 w-4 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="rounded-full bg-amber-200/60 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
              Official Update
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-950 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBanner
