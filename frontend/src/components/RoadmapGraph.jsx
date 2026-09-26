import ReactFlow, { Background, Controls, Position } from 'reactflow'
import 'reactflow/dist/style.css'

const COLUMN_SPACING_X = 280
const ROW_SPACING_Y = 110

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
// column) and edges: solid arrowed ones for dependsOn, dashed undirected ones
// for canRunParallelWith.
function buildGraph(steps) {
  const column = computeColumns(steps)
  const rowInColumn = new Map() // column -> how many nodes already placed there

  const nodes = steps.map((step) => {
    const col = column.get(step.stepId)
    const row = rowInColumn.get(col) || 0
    rowInColumn.set(col, row + 1)

    return {
      id: step.stepId,
      position: { x: col * COLUMN_SPACING_X, y: row * ROW_SPACING_Y },
      // Left-to-right layout — connect out the right side, in on the left side,
      // so arrows flow forward in a straight line instead of looping via the
      // default top/bottom handles.
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: step.name },
      style: {
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        padding: 10,
        background: 'white',
        cursor: 'pointer',
        width: 220,
      },
    }
  })

  const dependsOnEdges = steps.flatMap((step) =>
    (step.dependsOn || []).map((depId) => ({
      id: `dep-${depId}-${step.stepId}`,
      source: String(depId),
      target: step.stepId,
      animated: false,
    }))
  )

  // Dashed, undirected-looking connector between canRunParallelWith pairs —
  // only added once per pair (when this step's id sorts first) so the same
  // pair isn't drawn twice from each side.
  const parallelEdges = steps.flatMap((step) =>
    (step.canRunParallelWith || [])
      .filter((partnerId) => step.stepId < String(partnerId))
      .map((partnerId) => ({
        id: `parallel-${step.stepId}-${partnerId}`,
        source: step.stepId,
        target: String(partnerId),
        type: 'straight',
        animated: false,
        style: { strokeDasharray: '5,5', stroke: '#94a3b8' },
        label: 'can be done together',
        labelStyle: { fill: '#64748b', fontSize: 11 },
      }))
  )

  return { nodes, edges: [...dependsOnEdges, ...parallelEdges] }
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
      <div className="h-96 w-full rounded-md border border-slate-200 bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

export default RoadmapGraph
