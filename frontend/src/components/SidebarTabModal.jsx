import { X, CheckCircle2, FileText, Download, Landmark, ExternalLink, ShieldCheck, HelpCircle, Phone } from 'lucide-react'

// Flattens each step's documents into one deduplicated list for the whole
// task. Handles both the real { name, tag } shape and a plain string
// fallback (used by the pre-search placeholder roadmap).
function collectTaskDocuments(steps) {
  const byName = new Map()
  for (const step of steps) {
    for (const doc of step.documents || []) {
      const name = typeof doc === 'string' ? doc : doc.name
      const tag = typeof doc === 'string' ? '' : doc.tag || ''
      if (!byName.has(name)) byName.set(name, tag)
    }
  }
  return Array.from(byName.entries()).map(([name, tag]) => ({ name, tag }))
}

function SidebarTabModal({
  activeTab,
  onClose,
  steps = [],
  taskTitle = 'This Task',
  cityName = '',
  forms = [],
  feeBreakdown = [],
  departments = [],
  ownedDocuments = [],
  onToggleDocumentOwned,
}) {
  if (!activeTab || activeTab === 'Roadmap') return null

  const documents = collectTaskDocuments(steps)
  const ownedSet = new Set(ownedDocuments)
  const uniqueDepartmentNames = [...new Set(steps.map((s) => s.department).filter(Boolean))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E5D9C8] bg-white p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#FFF4F0] px-2.5 py-1 text-xs font-extrabold text-[#C84B24] border border-[#FADCD1]">
              {activeTab}
            </span>
            <h3 className="text-lg font-serif-title font-bold text-[#1E293B]">
              {taskTitle} Details
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#EBE1D3] text-[#64748B] hover:bg-[#F3EBE0] hover:text-[#1E293B] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* OVERVIEW CONTENT */}
        {activeTab === 'Overview' && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#F5E6CD] bg-[#FFF8EC] p-4 space-y-2">
              <h4 className="font-bold text-[#8C5815] text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#D97706]" />
                Process Summary & Scope
              </h4>
              <p className="text-[#4A3B28] leading-relaxed">
                {taskTitle} involves {steps.length} step{steps.length === 1 ? '' : 's'}
                {cityName ? ` for ${cityName}` : ''}
                {uniqueDepartmentNames.length > 0
                  ? `, covering ${uniqueDepartmentNames.join(', ')}.`
                  : '.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] p-3 space-y-1">
                <p className="text-[#64748B] font-semibold">Total Steps</p>
                <p className="text-sm font-bold text-[#1E293B]">{steps.length}</p>
              </div>
              <div className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] p-3 space-y-1">
                <p className="text-[#64748B] font-semibold">Departments Involved</p>
                <p className="text-sm font-bold text-[#1E293B]">
                  {uniqueDepartmentNames.length > 0 ? uniqueDepartmentNames.length : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS CONTENT */}
        {activeTab === 'Documents' && (
          <div className="space-y-4 text-xs">
            {documents.length === 0 ? (
              <p className="text-[#64748B] font-medium">No documents listed for this task yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[#64748B] font-medium">
                    Check off documents you already own to track your readiness:
                  </p>
                  <span className="text-xs font-bold text-[#C84B24] bg-[#FFF4F0] px-2.5 py-1 rounded-full border border-[#FADCD1]">
                    {ownedSet.size} of {documents.length} Owned
                  </span>
                </div>

                <div className="space-y-2">
                  {documents.map((doc) => {
                    const isChecked = ownedSet.has(doc.name)
                    return (
                      <div
                        key={doc.name}
                        onClick={() => onToggleDocumentOwned && onToggleDocumentOwned(doc.name, !isChecked)}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                          isChecked
                            ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
                            : 'border-[#E5D9C8] bg-white text-[#1E293B] hover:border-[#C84B24]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              isChecked ? 'text-[#166534] fill-[#166534]/10' : 'text-[#94A3B8]'
                            }`}
                          />
                          <span className="font-semibold text-xs">{doc.name}</span>
                        </div>
                        {doc.tag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EBE1D3] text-[#64748B]">
                            {doc.tag}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* FORMS CONTENT */}
        {activeTab === 'Forms' && (
          <div className="space-y-3 text-xs">
            {forms.length === 0 ? (
              <p className="text-[#64748B] font-medium">No official forms listed for this task yet.</p>
            ) : (
              <>
                <p className="text-[#64748B] font-medium">
                  Official application forms for this task:
                </p>
                {forms.map((form) => (
                  <div key={form._id || form.link} className="flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#C84B24]" />
                      <div>
                        <h5 className="font-bold text-[#1E293B] text-xs">{form.title}</h5>
                        {form.department && <p className="text-[10px] text-[#64748B]">{form.department}</p>}
                      </div>
                    </div>
                    <a
                      href={form.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-[#E5D9C8] bg-[#FAF7F2] px-3 py-1.5 font-bold text-[#C84B24] hover:bg-[#F3EBE0] transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Access Form</span>
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* FEES CONTENT */}
        {activeTab === 'Fees' && (
          <div className="space-y-3 text-xs">
            {feeBreakdown.length === 0 ? (
              <p className="text-[#64748B] font-medium">No fee information listed for this task yet.</p>
            ) : (
              <>
                <p className="text-[#64748B] font-medium">
                  Breakdown of official government fees for each step:
                </p>
                <div className="rounded-xl border border-[#E5D9C8] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E5D9C8] text-[#1E293B] font-bold">
                        <th className="p-2.5">Service / Step</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5 text-right">Government Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6D8] text-[#475569]">
                      {feeBreakdown.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold">{row.service}</td>
                          <td className="p-2.5">{row.department}</td>
                          <td className="p-2.5 text-right font-bold">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* DEPARTMENTS CONTENT */}
        {activeTab === 'Departments' && (
          <div className="space-y-3 text-xs">
            {departments.length === 0 ? (
              <p className="text-[#64748B] font-medium">No department information listed for this task yet.</p>
            ) : (
              <>
                <p className="text-[#64748B] font-medium">
                  Government departments managing this task:
                </p>
                {departments.map((dept) => (
                  <div key={dept._id || dept.name} className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-[#1E293B] text-xs flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-[#C84B24]" />
                        {dept.name}
                      </h5>
                      <a
                        href={dept.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#C84B24] hover:underline"
                      >
                        {dept.portalUrl}
                      </a>
                    </div>
                    {dept.helpline ? (
                      <p className="text-[#64748B] text-[11px] pl-6 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> Helpline: {dept.helpline}
                      </p>
                    ) : (
                      <p className="text-[#94A3B8] text-[11px] pl-6">Helpline not available yet</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* OFFICIAL SOURCES CONTENT */}
        {activeTab === 'Official Sources' && (
          <div className="space-y-3 text-xs">
            {steps.length === 0 ? (
              <p className="text-[#64748B] font-medium">No sources listed for this task yet.</p>
            ) : (
              <>
                <p className="text-[#64748B] font-medium">
                  Verified government portals and official documentation links:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...new Map(steps.filter((s) => s.sourceUrl).map((s) => [s.sourceUrl, s])).values()].map(
                    (step) => (
                      <a
                        key={step.sourceUrl}
                        href={step.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-white p-3 hover:border-[#C84B24] transition shadow-2xs group"
                      >
                        <div className="min-w-0">
                          <h5 className="font-bold text-[#1E293B] text-xs group-hover:text-[#C84B24] truncate">
                            {step.sourceTitle || step.name}
                          </h5>
                          <p className="text-[10px] text-[#94A3B8] font-normal truncate">{step.sourceUrl}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-[#C84B24] shrink-0" />
                      </a>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* HELP CONTENT */}
        {activeTab === 'Help' && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] p-4 space-y-2">
              <h4 className="font-bold text-[#1E293B] text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#C84B24]" />
                How to use CivicPath
              </h4>
              <ul className="space-y-2 text-[#475569] leading-relaxed">
                <li>• <strong>Flow View:</strong> Visualizes step-by-step parallel branches, based on which steps can be done at the same time.</li>
                <li>• <strong>Step Cards:</strong> Click any card to inspect required documents, government departments, and source links in the right panel.</li>
                <li>• <strong>Color Themes:</strong> Customize the flowchart palette using the top-right theme dropdown.</li>
                <li>• <strong>Save Roadmap:</strong> Click 🔖 Save Roadmap to keep your progress synced to your account.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#F0E6D8] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1E293B] text-white px-4 py-2 text-xs font-bold hover:bg-[#334155] transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default SidebarTabModal
