import { useState, useEffect } from 'react'
import { Search, MapPin, ArrowRight, Loader2, ChevronDown } from 'lucide-react'

// Each of these maps to a task that actually exists in the database — picking
// a task the backend has no data for always returns "we don't have
// information on this yet," which is confusing when it's presented as a
// ready-to-click example.
const TRY_EXAMPLES = [
  { label: 'Register a business', query: 'I want to register a small business in Mumbai', state: 'Mumbai' },
  { label: 'Birth certificate', query: 'Apply for a birth certificate in Mumbai', state: 'Mumbai' },
  { label: 'MSME / Udyam registration', query: 'Register as an MSME (Udyam)', state: 'All India' },
  { label: 'Apply for a passport', query: 'Apply for a passport', state: 'All India' },
]

function TaskInputForm({ onSubmit, isLoading, currentQuery, currentCity }) {
  const [text, setText] = useState(currentQuery || '')
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Mumbai')

  // Re-sync when a saved roadmap is opened (currentQuery/currentCity change
  // from outside) — without this the box kept showing stale text from
  // whatever was typed/loaded before.
  useEffect(() => {
    if (currentQuery) setText(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity)
  }, [currentCity])

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim()) {
      onSubmit({ text: text.trim(), city: selectedCity })
    }
  }

  function handleExampleClick(example) {
    setText(example.query)
    setSelectedCity(example.state)
    onSubmit({ text: example.query, city: example.state })
  }

  return (
    // Rendered as a sibling of <Header>, outside <main>'s max-w-7xl/padding,
    // so this is naturally full width with no vw-based hack (which was
    // getting a few extra px from the scrollbar and pushing the monument
    // partly off-screen).
    <div className="relative w-full overflow-hidden">
      {/* Warm sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDEBD8] via-[#FCE2C8] to-[#F7D6B8]" />

      {/* Illustrated skyline (matching the reference design) */}
      <img
        src="/hero/skyline-left.png"
        alt=""
        aria-hidden="true"
        className="absolute left-0 bottom-0 h-full w-auto max-w-[9%] object-contain object-bottom pointer-events-none hidden sm:block opacity-45"
      />
      {/* Hand-illustrated monument (Gateway of India-style arch) — drawn in
          full rather than extracted from a reference screenshot, so the
          whole structure is always guaranteed visible, nothing cropped. */}
      {/* Box's aspect-ratio matches the viewBox (400:300 = 4:3) exactly, so
          the illustration always shows in full — never cropped, never
          leaving a gap — regardless of how wide the banner is. */}
      <div className="absolute right-0 bottom-0 h-[calc(85%+15px)] aspect-[4/3] pointer-events-none">
      <svg
        className="absolute bottom-0 right-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMaxYMax meet"
        aria-hidden="true"
      >
        {/* Distant skyline */}
        <g fill="#C84B24" opacity="0.25">
          <rect x="10" y="180" width="18" height="70" />
          <rect x="34" y="160" width="16" height="90" />
          <rect x="330" y="170" width="16" height="80" />
          <rect x="352" y="150" width="18" height="100" />
        </g>

        {/* Water */}
        <rect x="0" y="255" width="400" height="45" fill="#7FA8BE" opacity="0.55" />
        <rect x="0" y="255" width="400" height="6" fill="#FFFFFF" opacity="0.35" />

        {/* Boats */}
        <g fill="#3E5C6B" opacity="0.7">
          <path d="M60 272 L90 272 L84 282 L66 282 Z" />
          <rect x="72" y="262" width="2.5" height="12" />
          <path d="M280 278 L320 278 L313 288 L287 288 Z" />
          <rect x="301" y="266" width="2.5" height="14" />
        </g>

        {/* Base platform */}
        <rect x="120" y="238" width="220" height="20" rx="2" fill="#A5391B" />
        <rect x="132" y="228" width="196" height="12" fill="#B5401D" />

        {/* Main block */}
        <rect x="140" y="120" width="180" height="112" fill="#C84B24" />
        {/* Cornice band under the domes */}
        <rect x="150" y="100" width="160" height="20" fill="#B5401D" />

        {/* Central arch opening (sky shows through) */}
        <path d="M195 232 V170 A45 45 0 0 1 285 170 V232 Z" fill="#FCE2C8" />
        {/* Flanking pillars either side of the arch */}
        <rect x="172" y="130" width="16" height="102" fill="#C84B24" />
        <rect x="292" y="130" width="16" height="102" fill="#C84B24" />

        {/* Small decorative side-wing arches */}
        <path d="M155 232 V205 A16 16 0 0 1 187 205 V232 Z" fill="#FCE2C8" opacity="0.85" />
        <path d="M293 232 V205 A16 16 0 0 1 325 205 V232 Z" fill="#FCE2C8" opacity="0.85" />

        {/* Central dome cluster */}
        <circle cx="240" cy="70" r="20" fill="#C84B24" />
        <rect x="234" y="45" width="12" height="20" fill="#C84B24" />
        <circle cx="240" cy="40" r="4" fill="#C84B24" />
        <rect x="222" y="88" width="36" height="14" fill="#C84B24" />

        {/* Four corner minarets */}
        {[150, 178, 302, 330].map((cx, i) => (
          <g key={cx}>
            <circle cx={cx} cy="92" r="9" fill="#C84B24" />
            <rect x={cx - 5} y="100" width="10" height="24" fill="#C84B24" />
          </g>
        ))}

        {/* Outer corner turrets at the very edges of the base */}
        <g fill="#C84B24">
          <circle cx="140" cy="216" r="8" />
          <rect x="133" y="223" width="14" height="16" />
          <circle cx="320" cy="216" r="8" />
          <rect x="313" y="223" width="14" height="16" />
        </g>

        {/* Clouds */}
        <g fill="#FFFFFF" opacity="0.5">
          <ellipse cx="60" cy="40" rx="34" ry="10" />
          <ellipse cx="90" cy="34" rx="22" ry="7" />
        </g>

        {/* Birds */}
        <g stroke="#8C5815" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M60 90 q7 -7 14 0 q7 -7 14 0" />
          <path d="M95 105 q6 -6 12 0 q6 -6 12 0" />
        </g>
      </svg>
      </div>

      {/* Content sits above the illustration, aligned to the same
          container width as the rest of the page */}
      <div className="relative z-10 mx-auto max-w-7xl flex flex-col items-start px-4 sm:px-8 py-4">
        <div className="text-left mb-3 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#1E293B] tracking-tight mb-1">
            What do you want to <span className="text-[#C84B24] italic">do?</span>
          </h1>
          <p className="text-sm text-[#5A5046] font-medium">
            Get a step-by-step roadmap for any government task.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="w-full max-w-2xl rounded-xl bg-white p-2 shadow-civic-md border border-[#E5D9C8]">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-1.5">
            {/* Main Query Input */}
            <div className="relative flex-1 w-full flex items-center bg-[#FAF7F2] rounded-lg border border-[#EBE1D3] px-3 py-2 focus-within:border-[#C84B24] transition">
              <Search className="h-4 w-4 text-[#94A3B8] shrink-0 mr-2" />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I want to register a small business in Mumbai"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
                required
              />
            </div>

            {/* State / Location Selector */}
            <div className="relative w-full sm:w-40 flex items-center bg-[#FAF7F2] rounded-lg border border-[#EBE1D3] px-3 py-2">
              <MapPin className="h-3.5 w-3.5 text-[#C84B24] shrink-0 mr-1.5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#1E293B] focus:outline-none cursor-pointer appearance-none pr-5"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="All India">All India (nationwide)</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-[#64748B] absolute right-2.5 pointer-events-none" />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-[#C84B24] hover:bg-[#AF3C19] text-white px-4 py-2 font-bold text-xs sm:text-sm shadow-md shadow-[#C84B24]/20 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Building…</span>
                </>
              ) : (
                <>
                  <span>Generate Roadmap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Try Examples Pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <span className="font-bold text-[#1E293B]">Try examples:</span>
          {TRY_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(ex)}
              className="rounded-full bg-white/90 border border-[#EBE1D3] px-3 py-1 text-[11px] font-semibold text-[#1E293B] hover:border-[#C84B24] hover:text-[#C84B24] transition shadow-2xs"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskInputForm

