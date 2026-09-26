// Shows one step's full details. Renders nothing if no step is selected.
function StepDetailPanel({ step, onClose }) {
  if (!step) return null

  const hasRealSource = typeof step.sourceUrl === 'string' && step.sourceUrl.startsWith('http')

  return (
    <div className="w-full max-w-4xl rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{step.name}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Department</dt>
          <dd className="text-slate-800">{step.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Estimated time</dt>
          <dd className="text-slate-800">
            {step.estimatedDays ? `${step.estimatedDays} day(s)` : 'Not specified'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Fees</dt>
          <dd className="text-slate-800">{step.fees || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Eligibility</dt>
          <dd className="text-slate-800">{step.eligibility || 'Not specified'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium text-slate-500">Documents needed</dt>
          <dd className="text-slate-800">
            {step.documents && step.documents.length > 0 ? (
              <ul className="list-disc pl-5">
                {step.documents.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            ) : (
              'Not specified'
            )}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium text-slate-500">Source</dt>
          <dd className="text-slate-800">
            {hasRealSource ? (
              <a
                href={step.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {step.sourceUrl}
              </a>
            ) : (
              'Source: not yet verified'
            )}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default StepDetailPanel
