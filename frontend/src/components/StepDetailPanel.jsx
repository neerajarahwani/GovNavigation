import { Lightbulb, FileText, Landmark, Link as LinkIcon, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2 } from 'lucide-react'

function StepDetailPanel({
  step,
  stepIndex = 1,
  totalSteps = 8,
  onPrevStep,
  onNextStep,
  isCompleted = false,
  onToggleComplete,
}) {
  if (!step) return null

  const displayIndex = stepIndex || 2
  const total = totalSteps || 8

  // Fallback defaults matching the exact reference image if fields are empty
  const title = step.name || 'Choose Business Structure'
  const description =
    step.description ||
    step.subtitle ||
    'Decide the legal structure for your business based on your goals, liability, and investment.'

  const keyPoints = step.keyPoints || [
    'Common options: Sole Proprietorship, Partnership, LLP, Private Limited Company',
    'Consider liability, taxation, and compliance requirements',
    'Some business types may require prior approval',
    'You can also register under Udyam for MSME benefits',
  ]

  const documents = step.documents || [
    'PAN card (individual or entity)',
    'Identity proof (Aadhaar, Passport, etc.)',
    'Address proof (rental agreement, utility bill, etc.)',
  ]

  const department = step.department || 'Ministry of Corporate Affairs (MCA)'
  const govtTag = step.govtTag || 'Government of India'

  const sourceTitle = step.sourceTitle || 'MCA - Types of Business Structures'
  const sourceUrl = step.sourceUrl || 'https://www.mca.gov.in/'

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-civic-sm border border-[#E5D9C8] flex flex-col gap-4">
      {/* Top Header & Pagination Controls — stays fixed, doesn't scroll */}
      <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
        <span className="text-xs font-semibold text-[#64748B]">
          Step {displayIndex} of {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevStep}
            disabled={displayIndex <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#EBE1D3] bg-[#FAF7F2] text-[#1E293B] hover:bg-[#F3EBE0] disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Previous Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextStep}
            disabled={displayIndex >= total}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#EBE1D3] bg-[#FAF7F2] text-[#1E293B] hover:bg-[#F3EBE0] disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Next Step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content — bounded height so a long real-world description
          doesn't stretch the whole page; only this area scrolls. */}
      <div className="max-h-[52vh] overflow-y-auto pr-1 -mr-1 space-y-4">
        {/* Step Title & Subtitle */}
        <div>
          <h3 className="text-xl font-serif-title font-bold text-[#1E293B] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Card Section 1: Key Points (Tan Highlight Box) */}
        <div className="rounded-xl border border-[#F5E6CD] bg-[#FFF8EC] p-3.5">
          <div className="flex items-center gap-2 font-bold text-xs text-[#8C5815] mb-2">
            <Lightbulb className="h-4 w-4 text-[#D97706] fill-[#FBBF24]/30" />
            <span>Key Points</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#4A3B28] font-medium pl-1">
            {keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card Section 2: Documents Required */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-[#1E293B]">
            <FileText className="h-4 w-4 text-[#C84B24]" />
            <span>Documents Required</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#475569] font-medium pl-1">
            {documents.map((doc, i) => {
              const docName = typeof doc === 'string' ? doc : doc.name
              const docTag = typeof doc === 'string' ? null : doc.tag
              return (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C84B24] mt-1.5 shrink-0" />
                  <span>
                    {docName}
                    {docTag ? (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#EBE1D3] text-[#64748B]">
                        {docTag}
                      </span>
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Card Section 3: Relevant Department */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs text-[#1E293B]">
            <Landmark className="h-4 w-4 text-[#C84B24]" />
            <span>Relevant Department</span>
          </div>
          <p className="text-xs font-bold text-[#1E293B] pl-6">{department}</p>
          <p className="text-[11px] text-[#64748B] pl-6 font-medium">{govtTag}</p>
        </div>

        {/* Card Section 4: Official Source */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-[#1E293B]">
            <LinkIcon className="h-4 w-4 text-[#C84B24]" />
            <span>Official Source</span>
          </div>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] p-3 text-xs font-bold text-[#1E293B] hover:border-[#C84B24] transition shadow-2xs group"
          >
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs text-[#1E293B] group-hover:text-[#C84B24]">
                {sourceTitle}
              </p>
              <p className="truncate text-[10px] text-[#94A3B8] font-normal mt-0.5">
                {sourceUrl}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-[#C84B24] shrink-0" />
          </a>
        </div>
      </div>

      {/* Mark Step Complete */}
      {onToggleComplete && (
        <button
          type="button"
          onClick={() => onToggleComplete(!isCompleted)}
          className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-bold transition ${
            isCompleted
              ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
              : 'border-[#E5D9C8] bg-white text-[#1E293B] hover:bg-[#FAF7F2]'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${isCompleted ? 'fill-[#166534]/10' : ''}`} />
          <span>{isCompleted ? 'Marked as Complete' : 'Mark Step Complete'}</span>
        </button>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#F0E6D8]">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={displayIndex <= 1}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E5D9C8] bg-white px-3 py-2.5 text-xs font-bold text-[#1E293B] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Step</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={displayIndex >= total}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#C84B24]/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span>Next Step</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default StepDetailPanel

