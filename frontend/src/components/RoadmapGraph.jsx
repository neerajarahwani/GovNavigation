import ReactFlow, { Background, Controls, Position } from 'reactflow'
import 'reactflow/dist/style.css'

const NODE_SPACING_X = 260
const NODE_Y = 100

// Turns an ordered step list into React Flow nodes (one per step, simple fixed
// spacing left-to-right) and edges (one per dependsOn entry, pointing from the
// depended-on step to the dependent one).
function buildGraph(steps, onNodeClick) {
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

function RoadmapGraph({ steps, onStepSelect }) {
  const { nodes, edges } = buildGraph(steps, onStepSelect)

  function handleNodeClick(_event, node) {
    const step = steps.find((s) => s.stepId === node.id)
    if (step) onStepSelect(step)
  }

  return (
    <div className="h-96 w-full max-w-4xl rounded-md border border-slate-200 bg-slate-50">
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
  )
}

export default RoadmapGraph
