import ReactFlow, { Background, Controls, Position, MarkerType, Handle } from 'reactflow'
import 'reactflow/dist/style.css'

const COLUMN_SPACING_X = 280
const ROW_SPACING_Y = 110

// A step box with 4 separate connection points: left/right for the normal
// "do this, then that" flow, and top/bottom just for the "can be done
// together" connector between two steps stacked in the same column. Without
// separate top/bottom points, that connector would have to loop around from
// the default side handles and render hidden behind the boxes.
function StepNode({ data }) {
  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        padding: 10,
        background: 'white',
        cursor: 'pointer',
        width: 220,
      }}
    >
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      {data.label}
    </div>
  )
}

const nodeTypes = { step: StepNode }

// Assigns each step a column based on dependency depth (how many steps must
// happen before it), then merges canRunParallelWith pairs into the same
// column, so explicitly-linked parallel steps always land side by side even in
// the rare case dependency depth alone wouldn't have put them there.
function computeColumns(steps) {
  const column = new Map()

  // Base pass — steps arrive in dependency order, so each step's dependsOn
  // targets already have a column by the time we reach it.
  for (const step of steps) {
    const depColumns = (step.dependsOn || []).map((depId) => column.get(String(depId)) ?? 0)
    column.set(step.stepId, depColumns.length > 0 ? Math.max(...depColumns) + 1 : 0)
  }

  // Merge canRunParallelWith pairs into the same column. Repeat until stable —
  // a step can be linked to more than one partner.
  let changed = true
  while (changed) {
    changed = false
    for (const step of steps) {
      for (const partnerId of step.canRunParallelWith || []) {
        const a = column.get(step.stepId)
        const b = column.get(String(partnerId))
        if (b === undefined) continue
        const merged = Math.max(a, b)
        if (a !== merged) {
          column.set(step.stepId, merged)
          changed = true
        }
        if (b !== merged) {
          column.set(String(partnerId), merged)
          changed = true
        }
      }
    }
  }

  return column
}

// Turns an ordered step list into React Flow nodes (grouped into columns by
// dependency depth, with canRunParallelWith steps forced into the same
// column) and edges: solid arrowed ones for dependsOn, dashed green ones for
// canRunParallelWith.
function buildGraph(steps) {
  const column = computeColumns(steps)
  const rowInColumn = new Map() // column -> how many nodes already placed there
  const rowOf = new Map() // stepId -> its row, needed to order the parallel connector

  const nodes = steps.map((step) => {
    const col = column.get(step.stepId)
    const row = rowInColumn.get(col) || 0
    rowInColumn.set(col, row + 1)
    rowOf.set(step.stepId, row)

    return {
      id: step.stepId,
      type: 'step',
      position: { x: col * COLUMN_SPACING_X, y: row * ROW_SPACING_Y },
      data: { label: step.name },
    }
  })

  // "Do this, then that" edges — a solid, dark, right-angle line with a clear
  // arrowhead pointing at the step that comes next. smoothstep routing (right
  // angles, not a diagonal) keeps multiple crossing edges readable instead of
  // turning into an "X" of diagonal lines.
  const dependsOnEdges = steps.flatMap((step) =>
    (step.dependsOn || []).map((depId) => ({
      id: `dep-${depId}-${step.stepId}`,
      source: String(depId),
      sourceHandle: 'right',
      target: step.stepId,
      targetHandle: 'left',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 18, height: 18 },
    }))
  )

  // "Can be done together" connector — a straight vertical line from the
  // bottom of whichever step is higher up to the top of whichever is lower,
  // since a merged column always stacks them directly above/below each
  // other. Deliberately green and dashed, no arrowhead (it isn't a
  // direction, just a link). Only added once per pair (when this step's id
  // sorts first) so the same pair isn't drawn twice from each side.
  const parallelEdges = steps.flatMap((step) =>
    (step.canRunParallelWith || [])
      .filter((partnerId) => step.stepId < String(partnerId))
      .map((partnerId) => {
        const partnerIdStr = String(partnerId)
        const [upperId, lowerId] =
          rowOf.get(step.stepId) <= rowOf.get(partnerIdStr)
            ? [step.stepId, partnerIdStr]
            : [partnerIdStr, step.stepId]
        return {
          id: `parallel-${step.stepId}-${partnerId}`,
          source: upperId,
          sourceHandle: 'bottom',
          target: lowerId,
          targetHandle: 'top',
          type: 'straight',
          animated: false,
          style: { strokeDasharray: '6,6', stroke: '#16a34a', strokeWidth: 2 },
          label: 'can be done together',
          labelStyle: { fill: '#15803d', fontSize: 11, fontWeight: 600 },
          labelBgStyle: { fill: '#f0fdf4' },
        }
      })
  )

  return { nodes, edges: [...dependsOnEdges, ...parallelEdges] }
}

// Finds each canRunParallelWith pair once (not twice, once from each side) —
// used for the plain-text "can be done together" list under the graph.
function findParallelPairs(steps) {
  const byId = new Map(steps.map((s) => [s.stepId, s]))
  const pairs = []
  for (const step of steps) {
    for (const partnerId of step.canRunParallelWith || []) {
      const partner = byId.get(String(partnerId))
      if (partner && step.stepId < partner.stepId) {
        pairs.push([step.name, partner.name])
      }
    }
  }
  return pairs
}

// Sums estimatedDays across steps that have a real number set, skipping the rest.
function sumEstimatedDays(steps) {
  return steps.reduce((total, step) => {
    return typeof step.estimatedDays === 'number' ? total + step.estimatedDays : total
  }, 0)
}

// Pulls the first number out of each step's free-text fees string and sums
// what's parseable, plus how many steps that covered (for an honest label).
function sumApproxFees(steps) {
  let total = 0
  let matchedCount = 0
  for (const step of steps) {
    const match = typeof step.fees === 'string' ? step.fees.match(/\d+/) : null
    if (match) {
      total += Number(match[0])
      matchedCount += 1
    }
  }
  return { total, matchedCount }
}

function RoadmapGraph({ steps, onStepSelect, completedStepIds = [] }) {
  const { nodes, edges } = buildGraph(steps)

  function handleNodeClick(_event, node) {
    const step = steps.find((s) => s.stepId === node.id)
    if (step) onStepSelect(step)
  }

  const completedCount = steps.filter((s) => completedStepIds.includes(s.stepId)).length
  const totalSteps = steps.length
  const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  const totalDays = sumEstimatedDays(steps)
  const { total: feeTotal, matchedCount: feeMatchedCount } = sumApproxFees(steps)
  const parallelPairs = findParallelPairs(steps)

  return (
    <div className="w-full max-w-4xl">
      {(totalDays > 0 || feeMatchedCount > 0) && (
        <div className="mb-2 flex flex-wrap gap-x-4 text-sm text-slate-700">
          {totalDays > 0 && <span>Estimated total time: {totalDays} day(s)</span>}
          {feeMatchedCount > 0 && (
            <span>
              Approx. total fees: ₹{feeTotal} (based on {feeMatchedCount} of {totalSteps} steps)
            </span>
          )}
        </div>
      )}
      <div className="mb-2 text-sm text-slate-600">
        {completedCount} of {totalSteps} steps done — {percentage}%
      </div>
      <div className="mb-3 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div id="roadmap-graph-capture" className="h-96 w-full rounded-md border border-slate-200 bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <svg width="28" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="20" y2="5" stroke="#475569" strokeWidth="2" />
            <polygon points="20,1 28,5 20,9" fill="#475569" />
          </svg>
          Finish this, then do the next one
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="28" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="28" y2="5" stroke="#16a34a" strokeWidth="2" strokeDasharray="5,4" />
          </svg>
          Can be done at the same time
        </span>
      </div>
      {parallelPairs.length > 0 && (
        <div className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <span className="font-medium">Tip — do these together to save time: </span>
          {parallelPairs.map(([a, b], i) => (
            <span key={`${a}-${b}`}>
              {i > 0 && '; '}
              {a} + {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoadmapGraph
