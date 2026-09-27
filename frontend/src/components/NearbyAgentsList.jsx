import { useState, useEffect } from 'react'
import { MapPin, Phone, Star, ShieldCheck, Clock, Tag, ExternalLink, Check, Building2 } from 'lucide-react'
import agentsData from '../data/nearbyAgents.json'

function NearbyAgentsList({ currentCity = 'Maharashtra' }) {
  const availableRegions = [
    { label: 'Maharashtra (Mumbai, Pune, Thane)', key: 'maharashtra' },
    { label: 'Delhi NCR (Central, South, East Delhi)', key: 'delhi' },
    { label: 'Karnataka (Bangalore Urban & South)', key: 'karnataka' },
    { label: 'Tamil Nadu (Chennai Central & South)', key: 'tamil nadu' },
    { label: 'Gujarat (Ahmedabad, Surat)', key: 'gujarat' },
  ]

  const rawInput = (currentCity || '').toLowerCase()
  const initialKey =
    availableRegions.find((r) => rawInput.includes(r.key) || r.key.includes(rawInput))?.key || 'maharashtra'

  const [selectedRegionKey, setSelectedRegionKey] = useState(initialKey)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const input = (currentCity || '').toLowerCase()
    const matchedKey = availableRegions.find((r) => input.includes(r.key) || r.key.includes(input))?.key || 'maharashtra'
    setSelectedRegionKey(matchedKey)
  }, [currentCity])

  const agents = agentsData[selectedRegionKey] || agentsData.maharashtra

  function handleCopyPhone(agentId, phone) {
    navigator.clipboard.writeText(phone)
    setCopiedId(agentId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header & Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#F5E6CD] bg-[#FFF8EC] p-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4F0] border border-[#FADCD1] text-[#C84B24]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif-title font-bold text-sm text-[#1E293B]">
              Verified Nearby Documentation Agents & Consultants
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              Top facilitators across cities to help you prepare required documents & licenses.
            </p>
          </div>
        </div>

        {/* Region Filter Selector */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] bg-white border border-[#E5D9C8] rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-[#C84B24]" />
            <select
              value={selectedRegionKey}
              onChange={(e) => setSelectedRegionKey(e.target.value)}
              className="bg-transparent font-bold text-[#1E293B] focus:outline-none cursor-pointer pr-4"
            >
              {availableRegions.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agents List Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-2xs hover:border-[#C84B24] transition space-y-3"
          >
            {/* Top Row: Name, City Badge, Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E6D8] pb-2.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="font-bold text-sm text-[#1E293B]">{agent.name}</h5>
                  <span className="text-[10px] font-extrabold text-[#C84B24] bg-[#FFF4F0] border border-[#FADCD1] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-[#C84B24]" />
                    {agent.city}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-medium flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-[#C84B24] shrink-0" />
                  {agent.address}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 shrink-0 bg-[#FAF7F2] border border-[#EBE1D3] px-2.5 py-1 rounded-xl">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-extrabold text-[#1E293B]">{agent.rating}</span>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  ({agent.reviewsCount} reviews)
                </span>
              </div>
            </div>

            {/* Services Offered */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8C5815] uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3 w-3 text-[#D97706]" />
                Services Offered
              </span>
              <div className="flex flex-wrap gap-1.5">
                {agent.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-[#1E293B] bg-[#FAF7F2] border border-[#E5D9C8] px-2.5 py-0.5 rounded-lg"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing & Contact Actions */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] font-medium pt-1 gap-2 border-t border-[#F0E6D8]">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#C84B24] font-bold">{agent.pricing}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Clock className="h-3 w-3" />
                  {agent.operatingHours}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPhone(agent.id, agent.phone)}
                  className="flex items-center gap-1 rounded-xl border border-[#E5D9C8] bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#1E293B] hover:bg-[#F3EBE0] transition"
                >
                  {copiedId === agent.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-3.5 w-3.5 text-[#C84B24]" />
                      <span>{agent.phone}</span>
                    </>
                  )}
                </button>
                <a
                  href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1 rounded-xl bg-[#C84B24] hover:bg-[#AF3C19] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                >
                  <span>Call Now</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NearbyAgentsList
