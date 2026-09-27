import { X, CheckCircle2, FileText, Download, Landmark, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react'
import { useState } from 'react'

function SidebarTabModal({ activeTab, onClose, steps = [] }) {
  const [checkedDocs, setCheckedDocs] = useState(new Set(['PAN Card', 'Aadhaar Card']))

  if (!activeTab || activeTab === 'Roadmap') return null

  function toggleDoc(doc) {
    setCheckedDocs((prev) => {
      const next = new Set(prev)
      if (next.has(doc)) next.delete(doc)
      else next.add(doc)
      return next
    })
  }

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
              Business Registration Details
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
                Registering a business in Maharashtra involves 8 sequential and parallel steps covering structure selection, document attestation, incorporation under MCA/Udyam, tax registration (PAN, TAN, GST), and local municipal compliance (Shop & Establishment Act).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] p-3 space-y-1">
                <p className="text-[#64748B] font-semibold">Estimated Duration</p>
                <p className="text-sm font-bold text-[#1E293B]">7 to 14 Business Days</p>
              </div>
              <div className="rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] p-3 space-y-1">
                <p className="text-[#64748B] font-semibold">Jurisdiction</p>
                <p className="text-sm font-bold text-[#1E293B]">State of Maharashtra & Union Govt</p>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS CONTENT */}
        {activeTab === 'Documents' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-[#64748B] font-medium">
                Check off documents you already own to track your readiness:
              </p>
              <span className="text-xs font-bold text-[#C84B24] bg-[#FFF4F0] px-2.5 py-1 rounded-full border border-[#FADCD1]">
                {checkedDocs.size} of 6 Owned
              </span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'PAN Card (Individual or Entity)', tag: 'Identity & Tax' },
                { name: 'Aadhaar Card / Passport', tag: 'Identity Proof' },
                { name: 'Premises Rent Agreement & Landlord NOC', tag: 'Address Proof' },
                { name: 'Utility Bill (Electricity/Water < 2 months old)', tag: 'Address Proof' },
                { name: 'Digital Signature Certificate (DSC)', tag: 'MCA Incorporation' },
                { name: 'Bank Account Cancelled Cheque', tag: 'GST & Bank Account' },
              ].map((doc) => {
                const isChecked = checkedDocs.has(doc.name)
                return (
                  <div
                    key={doc.name}
                    onClick={() => toggleDoc(doc.name)}
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EBE1D3] text-[#64748B]">
                      {doc.tag}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FORMS CONTENT */}
        {activeTab === 'Forms' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B] font-medium">
              Official application forms required for incorporation and licensing:
            </p>
            {[
              { title: 'SPICe+ Part A & B (MCA Incorporation)', dept: 'Ministry of Corporate Affairs', link: 'https://www.mca.gov.in' },
              { title: 'Udyam Registration Portal (MSME Benefit)', dept: 'MSME Ministry', link: 'https://udyamregistration.gov.in' },
              { title: 'Form F - Intimation of Establishment', dept: 'Maharashtra Labour Department', link: 'https://aaplesarkar.mahaonline.gov.in' },
              { title: 'GST REG-01 Application Form', dept: 'Goods and Services Tax Network', link: 'https://www.gst.gov.in' },
            ].map((form, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#C84B24]" />
                  <div>
                    <h5 className="font-bold text-[#1E293B] text-xs">{form.title}</h5>
                    <p className="text-[10px] text-[#64748B]">{form.dept}</p>
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
          </div>
        )}

        {/* FEES CONTENT */}
        {activeTab === 'Fees' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B] font-medium">
              Breakdown of official government application fees & statutory costs:
            </p>
            <div className="rounded-xl border border-[#E5D9C8] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E5D9C8] text-[#1E293B] font-bold">
                    <th className="p-2.5">Service / Permit</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5 text-right">Government Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8] text-[#475569]">
                  <tr>
                    <td className="p-2.5 font-semibold">Udyam MSME Registration</td>
                    <td className="p-2.5">MSME Ministry</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">₹0 (Free)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">PAN & TAN Application</td>
                    <td className="p-2.5">Income Tax Dept</td>
                    <td className="p-2.5 text-right font-bold">₹110</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">GST Registration</td>
                    <td className="p-2.5">GSTN</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">₹0 (Free)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Shop & Establishment License</td>
                    <td className="p-2.5">Maharashtra Labour Dept</td>
                    <td className="p-2.5 text-right font-bold">₹236 - ₹1,000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Pvt Ltd MCA Incorporation</td>
                    <td className="p-2.5">MCA Portal</td>
                    <td className="p-2.5 text-right font-bold">₹0 - ₹2,000 (Stamp Duty)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPARTMENTS CONTENT */}
        {activeTab === 'Departments' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B] font-medium">
              Verified Government Departments managing your business registrations:
            </p>
            {[
              { name: 'Ministry of Corporate Affairs (MCA)', portal: 'mca.gov.in', helpline: '1800-11-2001' },
              { name: 'Maharashtra Labour Department', portal: 'aaplesarkar.mahaonline.gov.in', helpline: '1800-120-8040' },
              { name: 'GST Network (GSTN Portal)', portal: 'gst.gov.in', helpline: '1800-1200-232' },
              { name: 'Income Tax Department (NSDL/Protean)', portal: 'incometax.gov.in', helpline: '1800-180-1961' },
            ].map((dept, i) => (
              <div key={i} className="rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-[#1E293B] text-xs flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-[#C84B24]" />
                    {dept.name}
                  </h5>
                  <span className="text-[10px] font-bold text-[#C84B24]">{dept.portal}</span>
                </div>
                <p className="text-[#64748B] text-[11px] pl-6">Helpline: {dept.helpline}</p>
              </div>
            ))}
          </div>
        )}

        {/* OFFICIAL SOURCES CONTENT */}
        {activeTab === 'Official Sources' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B] font-medium">
              Verified government portals and official documentation links:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'MCA Official Portal', url: 'https://www.mca.gov.in/' },
                { name: 'Udyam Registration Portal', url: 'https://udyamregistration.gov.in/' },
                { name: 'Aaple Sarkar Maharashtra', url: 'https://aaplesarkar.mahaonline.gov.in/' },
                { name: 'Official GST India Portal', url: 'https://www.gst.gov.in/' },
              ].map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-[#E5D9C8] bg-white p-3 hover:border-[#C84B24] transition shadow-2xs group"
                >
                  <div>
                    <h5 className="font-bold text-[#1E293B] text-xs group-hover:text-[#C84B24]">
                      {src.name}
                    </h5>
                    <p className="text-[10px] text-[#94A3B8] font-normal">{src.url}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#C84B24] shrink-0" />
                </a>
              ))}
            </div>
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
                <li>• <strong>Flow View:</strong> Visualizes step-by-step parallel branches (e.g. GST & PAN/TAN can be completed simultaneously).</li>
                <li>• <strong>Step Cards:</strong> Click any card to inspect required documents, government departments, and source links in the right panel.</li>
                <li>• <strong>Color Themes:</strong> Customize the flowchart palette using the top-right theme dropdown.</li>
                <li>• <strong>Save Roadmap:</strong> Click 🔖 Save Roadmap to keep your progress synced.</li>
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
