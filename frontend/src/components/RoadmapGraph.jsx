import { useState } from 'react'
import {
  CheckCircle2,
  FileText,
  Building2,
  Flag,
  ChevronRight,
  GitFork,
  List,
  Sparkles,
  Palette,
  Check,
  ShieldCheck
} from 'lucide-react'

// Defined Color Combination Palettes for the Flowchart
export const FLOW_PALETTES = {
  terracotta: {
    name: 'Civic Terracotta',
    primary: '#C84B24',
    primaryBg: '#FFF4F0',
    primaryBorder: '#C84B24',
    completedBg: '#F0FDF4',
    completedBorder: '#166534',
    completedIcon: '#166534',
    cardBg: '#FFFFFF',
    cardBorder: '#E5D9C8',
    connector: '#94A3B8',
    badgeBg: '#E05628',
    badgeText: '#FFFFFF',
  },
  emerald: {
    name: 'Emerald Civic',
    primary: '#059669',
    primaryBg: '#ECFDF5',
    primaryBorder: '#059669',
    completedBg: '#F0FDF4',
    completedBorder: '#166534',
    completedIcon: '#166534',
    cardBg: '#FFFFFF',
    cardBorder: '#D1FAE5',
    connector: '#6EE7B7',
    badgeBg: '#047857',
    badgeText: '#FFFFFF',
  },
  indigo: {
    name: 'Modern Indigo',
    primary: '#4F46E5',
    primaryBg: '#EEF2FF',
    primaryBorder: '#4F46E5',
    completedBg: '#F0FDF4',
    completedBorder: '#166534',
    completedIcon: '#166534',
    cardBg: '#FFFFFF',
    cardBorder: '#E0E7FF',
    connector: '#818CF8',
    badgeBg: '#4338CA',
    badgeText: '#FFFFFF',
  },
  amber: {
    name: 'Warm Amber',
    primary: '#D97706',
    primaryBg: '#FFFBEB',
    primaryBorder: '#D97706',
    completedBg: '#F0FDF4',
    completedBorder: '#166534',
    completedIcon: '#166534',
    cardBg: '#FFFFFF',
    cardBorder: '#FDE68A',
    connector: '#FBBF24',
    badgeBg: '#B45309',
    badgeText: '#FFFFFF',
  },
}

// Groups steps into a render order of "nodes": a node is either one step, or
// a set of steps that mutually list each other in canRunParallelWith and
// should be drawn side by side. Works for any real task, not just a fixed
// 8-step demo shape — a step's canRunParallelWith is the only thing that
// decides whether it's shown as a parallel branch.
function buildStepNodes(steps) {
  const ids = steps.map((s) => String(s.stepId))
  const byId = new Map(steps.map((s) => [String(s.stepId), s]))
  const parent = new Map(ids.map((id) => [id, id]))

  function find(x) {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }
  function union(a, b) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (const s of steps) {
    const id = String(s.stepId)
    for (const otherId of s.canRunParallelWith || []) {
      if (byId.has(String(otherId))) union(id, String(otherId))
    }
  }

  const groupedIds = new Map()
  for (const id of ids) {
    const root = find(id)
    if (!groupedIds.has(root)) groupedIds.set(root, [])
    groupedIds.get(root).push(id)
  }

  const nodes = Array.from(groupedIds.values()).map((memberIds) => ({
    ids: memberIds,
    steps: memberIds.map((id) => byId.get(id)),
  }))

  const nodeIndexByStepId = new Map()
  nodes.forEach((node, idx) => node.ids.forEach((id) => nodeIndexByStepId.set(id, idx)))

  const nodeDeps = nodes.map((node, idx) => {
    const deps = new Set()
    for (const s of node.steps) {
      for (const depId of s.dependsOn || []) {
        const depIdx = nodeIndexByStepId.get(String(depId))
        if (depIdx !== undefined && depIdx !== idx) deps.add(depIdx)
      }
    }
    return deps
  })

  // Same safe topological placement as the backend: place a node once every
  // node it depends on is placed; anything left over (a cycle) is appended.
  const placed = new Set()
  const ordered = []
  let progressMade = true
  while (placed.size < nodes.length && progressMade) {
    progressMade = false
    nodes.forEach((node, idx) => {
      if (placed.has(idx)) return
      if ([...nodeDeps[idx]].every((d) => placed.has(d))) {
        ordered.push(idx)
        placed.add(idx)
        progressMade = true
      }
    })
  }
  nodes.forEach((_, idx) => {
    if (!placed.has(idx)) ordered.push(idx)
  })

  return ordered.map((idx) => nodes[idx])
}

function RoadmapGraph({
  steps = [],
  onStepSelect,
  selectedStepId,
  completedStepIds = [],
  taskTitle,
  cityName,
}) {
  const [viewMode, setViewMode] = useState('flow') // 'flow' | 'list'
  const [activePalette, setActivePalette] = useState('terracotta')
  const [showColorMenu, setShowColorMenu] = useState(false)

  const palette = FLOW_PALETTES[activePalette] || FLOW_PALETTES.terracotta

  // Helper to determine step status
  const getStepStatus = (stepId, index) => {
    if (completedStepIds.includes(stepId)) return 'completed'
    if (selectedStepId === stepId || (selectedStepId === null && index === 1))
      return 'active'
    return 'upcoming'
  }

  // Get icon for step type
  const getStepIcon = (step, status, isLast) => {
    if (status === 'completed') {
      return (
        <div className="h-6 w-6 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Check className="h-4 w-4 stroke-[3]" />
        </div>
      )
    }

    if (
      step.name.toLowerCase().includes('department') ||
      step.name.toLowerCase().includes('shop') ||
      step.department
    ) {
      return (
        <div
          className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
          style={
            status === 'active'
              ? { backgroundColor: palette.primary, color: '#FFFFFF', borderColor: palette.primary }
              : { backgroundColor: '#FAF7F2', color: palette.primary, borderColor: '#EBE1D3' }
          }
        >
          <Building2 className="h-4 w-4" />
        </div>
      )
    }

    if (isLast || step.name.toLowerCase().includes('start operations')) {
      return (
        <div
          className="h-6 w-6 rounded-lg bg-[#FAF7F2] border border-[#EBE1D3] flex items-center justify-center shrink-0"
          style={{ color: palette.primary }}
        >
          <Flag className="h-4 w-4 fill-current" />
        </div>
      )
    }

    return (
      <div
        className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
        style={
          status === 'active'
            ? { backgroundColor: palette.primary, color: '#FFFFFF', borderColor: palette.primary }
            : { backgroundColor: '#FAF7F2', color: palette.primary, borderColor: '#EBE1D3' }
        }
      >
        <FileText className="h-4 w-4" />
      </div>
    )
  }

  // Helper render card
  const renderStepCard = (step, index, isLast = false, isParallel = false) => {
    const status = getStepStatus(step.stepId, index)
    const isSelected = selectedStepId === step.stepId

    let style = {
      borderColor: '#E5D9C8',
      backgroundColor: '#FFFFFF',
    }

    if (status === 'completed') {
      style = {
        borderColor: '#166534',
        backgroundColor: '#F0FDF4',
      }
    } else if (status === 'active') {
      style = {
        borderColor: palette.primaryBorder,
        backgroundColor: palette.primaryBg,
        boxShadow: `0 0 0 3px ${palette.primary}20`,
      }
    }

    if (isSelected) {
      style.transform = 'scale(1.01)'
      style.boxShadow = `0 4px 12px ${palette.primary}25`
    }

    return (
      <div
        key={step.stepId}
        onClick={() => onStepSelect(step)}
        style={style}
        className="relative cursor-pointer rounded-xl border p-2.5 transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {getStepIcon(step, status, isLast)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-bold text-[#1E293B] truncate">
                  {step.name}
                </h4>
                {status === 'active' && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: palette.badgeBg }}
                  >
                    Current Step
                  </span>
                )}
                {isParallel && (
                  <span
                    className="flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ borderColor: palette.connector, color: palette.connector }}
                  >
                    <GitFork className="h-2.5 w-2.5" />
                    Parallel
                  </span>
                )}
                {step.sourceUrl && (
                  <span
                    className="flex items-center gap-0.5 rounded-full border border-[#166534]/30 bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-bold text-[#166534]"
                    title={
                      step.lastVerified
                        ? `Verified on ${new Date(step.lastVerified).toLocaleDateString()}`
                        : 'Verified from an official source'
                    }
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-medium">
                {step.subtitle || step.department || 'Understand requirements & complete procedures'}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#94A3B8] shrink-0" />
        </div>
      </div>
    )
  }

  // Group steps into single-step or parallel-group nodes, ordered so every
  // node appears only once every node it depends on has already appeared.
  const stepNodes = buildStepNodes(steps)
  let runningIndex = 0

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-civic-sm border border-[#E5D9C8]">
      {/* Container Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D8] pb-4 mb-5">
        <div>
          <h3 className="text-xl font-serif-title font-bold text-[#1E293B] tracking-tight">
            Your Roadmap
          </h3>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">
            {taskTitle ? `A step-by-step guide to ${taskTitle.toLowerCase()}` : 'A step-by-step guide to complete this process'}
            {cityName ? ` in ${cityName}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Color combination switcher pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-[#EBE1D3] bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#1E293B] hover:bg-[#F3EBE0] transition"
              title="Change Flowchart Color Combination"
            >
              <Palette className="h-3.5 w-3.5" style={{ color: palette.primary }} />
              <span className="hidden xs:inline">{palette.name}</span>
            </button>

            {showColorMenu && (
              <div className="absolute right-0 top-10 w-44 rounded-xl border border-[#E5D9C8] bg-white p-2 shadow-lg z-30 space-y-1">
                <p className="text-[10px] font-bold text-[#94A3B8] px-2 py-1 uppercase tracking-wider">
                  Color Themes
                </p>
                {Object.entries(FLOW_PALETTES).map(([key, pal]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActivePalette(key)
                      setShowColorMenu(false)
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      activePalette === key
                        ? 'bg-[#FAF7F2] font-bold'
                        : 'text-[#1E293B] hover:bg-slate-50'
                    }`}
                    style={activePalette === key ? { color: pal.primary } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <span>{pal.name}</span>
                    </div>
                    {activePalette === key && (
                      <Check className="h-3.5 w-3.5" style={{ color: pal.primary }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-[#F4EFE6] p-1 border border-[#EBE1D3]">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'flow'
                  ? 'bg-[#1E293B] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <GitFork className="h-3.5 w-3.5" />
              <span>Flow View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-[#1E293B] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLOW VIEW DIAGRAM */}
      {viewMode === 'flow' && (
        <div id="roadmap-graph-capture" className="flex flex-col items-center w-full max-w-xl mx-auto py-2 space-y-2">
          {/* Start marker */}
          {stepNodes.length > 0 && (
            <>
              <div
                className="rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-2xs"
                style={{ backgroundColor: palette.primary }}
              >
                Start
              </div>
              <div className="h-6 flex items-center justify-center my-0.5">
                <svg className="h-6 w-4 stroke-[#1E293B]" viewBox="0 0 16 24">
                  <line x1="8" y1="0" x2="8" y2="18" strokeWidth="2" stroke={palette.connector} />
                  <polygon points="4,16 8,24 12,16" fill={palette.connector} />
                </svg>
              </div>
            </>
          )}

          {stepNodes.map((node, nodeIdx) => {
            const isLastNode = nodeIdx === stepNodes.length - 1
            const isParallelGroup = node.steps.length > 1

            return (
              <div key={node.ids.join('-')} className="w-full flex flex-col items-center">
                {isParallelGroup ? (
                  <>
                    {/* Split arrow into the parallel branch */}
                    <div className="h-8 flex items-center justify-center w-full my-0.5">
                      <svg className="h-8 w-full max-w-md fill-none" viewBox="0 0 300 32">
                        <line x1="150" y1="0" x2="150" y2="12" strokeWidth="2" stroke={palette.connector} />
                        <line x1="75" y1="12" x2="225" y2="12" strokeWidth="2" stroke={palette.connector} />
                        <line x1="75" y1="12" x2="75" y2="24" strokeWidth="2" stroke={palette.connector} />
                        <polygon points="71,22 75,30 79,22" fill={palette.connector} stroke="none" />
                        <line x1="225" y1="12" x2="225" y2="24" strokeWidth="2" stroke={palette.connector} />
                        <polygon points="221,22 225,30 229,22" fill={palette.connector} stroke="none" />
                      </svg>
                    </div>

                    {/* Parallel side-by-side cards — dashed enclosure + label
                        marks this as a distinct "can be done together" notation,
                        not just two cards that happen to sit side by side. */}
                    <div
                      className="w-full rounded-xl border-2 border-dashed p-2.5 pt-6 relative"
                      style={{ borderColor: palette.connector }}
                    >
                      <span
                        className="absolute -top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: palette.connector }}
                      >
                        <GitFork className="h-3 w-3" />
                        Do these in parallel
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {node.steps.map((step) => {
                          runningIndex += 1
                          return renderStepCard(step, runningIndex, isLastNode, true)
                        })}
                      </div>
                    </div>

                    {/* Merge arrow back into the linear flow */}
                    <div className="h-8 flex items-center justify-center w-full my-0.5">
                      <svg className="h-8 w-full max-w-md fill-none" viewBox="0 0 300 32">
                        <line x1="75" y1="0" x2="75" y2="16" strokeWidth="2" stroke={palette.connector} />
                        <line x1="225" y1="0" x2="225" y2="16" strokeWidth="2" stroke={palette.connector} />
                        <line x1="75" y1="16" x2="225" y2="16" strokeWidth="2" stroke={palette.connector} />
                        <line x1="150" y1="16" x2="150" y2="26" strokeWidth="2" stroke={palette.connector} />
                        <polygon points="146,24 150,32 154,24" fill={palette.connector} stroke="none" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full">
                    {(() => {
                      runningIndex += 1
                      return renderStepCard(node.steps[0], runningIndex, isLastNode)
                    })()}
                  </div>
                )}

                {/* Connector down to the next node */}
                {!isLastNode && !isParallelGroup && (
                  <div className="h-6 flex items-center justify-center my-0.5">
                    <svg className="h-6 w-4 stroke-[#1E293B]" viewBox="0 0 16 24">
                      <line x1="8" y1="0" x2="8" y2="18" strokeWidth="2" stroke={palette.connector} />
                      <polygon points="4,16 8,24 12,16" fill={palette.connector} />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}

          {/* End marker */}
          {stepNodes.length > 0 && (
            <>
              <div className="h-6 flex items-center justify-center my-0.5">
                <svg className="h-6 w-4 stroke-[#1E293B]" viewBox="0 0 16 24">
                  <line x1="8" y1="0" x2="8" y2="18" strokeWidth="2" stroke={palette.connector} />
                  <polygon points="4,16 8,24 12,16" fill={palette.connector} />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-2xs bg-[#166534]">
                <Flag className="h-3.5 w-3.5 fill-current" />
                <span>End</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* LIST VIEW DIAGRAM */}
      {viewMode === 'list' && (
        <div className="space-y-3 py-2">
          {steps.map((step, idx) => (
            <div key={step.stepId}>
              {renderStepCard(step, idx + 1, idx === steps.length - 1, (step.canRunParallelWith || []).length > 0)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoadmapGraph

