import { useState } from 'react'
import { Search, MapPin, ArrowRight, Loader2, ChevronDown } from 'lucide-react'

const TRY_EXAMPLES = [
  { label: 'Start a business', query: 'I want to start a business in Maharashtra', state: 'Maharashtra' },
  { label: 'Apply for caste certificate', query: 'Apply for caste certificate in Maharashtra', state: 'Maharashtra' },
  { label: 'Get a trade license', query: 'Get a trade license in Maharashtra', state: 'Maharashtra' },
  { label: 'Register a NGO', query: 'Register a NGO in Maharashtra', state: 'Maharashtra' },
]

function TaskInputForm({ onSubmit, isLoading, currentQuery, currentCity }) {
  const [text, setText] = useState(currentQuery || 'I want to start a business in Maharashtra')
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Maharashtra')

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
    <div className="w-full max-w-5xl flex flex-col items-center">
      {/* Hero Banner Title */}
      <div className="text-center mb-6 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-serif-title font-bold text-[#1E293B] tracking-tight mb-2">
          What do you want to <span className="text-[#C84B24] italic">do?</span>
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] font-medium">
          Get a step-by-step roadmap for any government task.
        </p>
      </div>

      {/* Hero Search Box Container with Architectural Skyline Overlay */}
      <div className="w-full relative rounded-2xl bg-white/95 p-3 sm:p-4 shadow-civic-md border border-[#E5D9C8]">
        {/* Subtle background SVG monument graphic on right side of hero search */}
        <div className="absolute right-3 bottom-0 top-0 opacity-15 pointer-events-none hidden lg:block overflow-hidden rounded-r-2xl">
          <svg className="h-full w-48 stroke-[#C84B24] fill-none" viewBox="0 0 200 120" strokeWidth="1">
            <path d="M10 120 V80 H30 V60 H50 V40 H80 V20 H120 V40 H150 V60 H170 V80 H190 V120 Z" />
            <circle cx="100" cy="35" r="12" />
            <path d="M90 60 H110 V120 H90 Z" />
            <path d="M40 80 H60 V120 H40 Z" />
            <path d="M140 80 H160 V120 H140 Z" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-2">
          {/* Main Query Input */}
          <div className="relative flex-1 w-full flex items-center bg-[#FAF7F2] rounded-xl border border-[#EBE1D3] px-3.5 py-2.5 focus-within:border-[#C84B24] transition">
            <Search className="h-5 w-5 text-[#94A3B8] shrink-0 mr-3" />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I want to start a business in Maharashtra"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
              required
            />
          </div>

          {/* State / Location Selector */}
          <div className="relative w-full md:w-56 flex items-center bg-[#FAF7F2] rounded-xl border border-[#EBE1D3] px-3.5 py-2.5">
            <MapPin className="h-4 w-4 text-[#C84B24] shrink-0 mr-2" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-[#1E293B] focus:outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Gujarat">Gujarat</option>
            </select>
            <ChevronDown className="h-4 w-4 text-[#64748B] absolute right-3 pointer-events-none" />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] text-white px-6 py-3 font-bold text-sm shadow-md shadow-[#C84B24]/20 transition active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Building Roadmap…</span>
              </>
            ) : (
              <>
                <span>Generate Roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Try Examples Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#64748B]">
        <span className="font-bold text-[#1E293B]">Try examples:</span>
        {TRY_EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleExampleClick(ex)}
            className="rounded-full bg-white border border-[#EBE1D3] px-3.5 py-1 text-xs font-semibold text-[#1E293B] hover:border-[#C84B24] hover:text-[#C84B24] transition shadow-2xs"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TaskInputForm

