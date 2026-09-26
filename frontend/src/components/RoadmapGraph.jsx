import ReactFlow, { Background, Controls, Position } from 'reactflow'
import 'reactflow/dist/style.css'

const NODE_SPACING_X = 260
const NODE_Y = 100

// Turns an ordered step list into React Flow nodes (one per step, simple fixed
// spacing left-to-right) and edges (one per dependsOn entry, pointing from the
// depended-on step to the dependent one).
function buildGraph(steps) {
  const nodes = steps.map((step, index) => ({
    id: step.stepId,
    position: { x: index * NODE_SPACING_X, y: NODE_Y },
    // Left-to-right layout — connect out the right side, in on the left side, so
    // arrows flow forward in a straight line instead of looping via the default
    // top/bottom handles.
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
  }))

  const edges = steps.flatMap((step) =>
    (step.dependsOn || []).map((depId) => ({
      id: `${depId}-${step.stepId}`,
      source: String(depId),
      target: step.stepId,
      animated: false,
    }))
  )

  return { nodes, edges }
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
