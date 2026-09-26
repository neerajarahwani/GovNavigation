// Shows active announcements as a small notice list. Renders nothing if there
// are none — never an empty box.
function AnnouncementBanner({ announcements }) {
  if (!announcements || announcements.length === 0) return null

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      {announcements.map((a) => (
        <div key={a._id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="font-medium text-amber-900">{a.title}</p>
          <p className="text-sm text-amber-800">{a.body}</p>
        </div>
      ))}
    </div>
  )
}

export default AnnouncementBanner
