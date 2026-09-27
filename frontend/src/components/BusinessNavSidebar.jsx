import { useState } from 'react'
import {
  Map,
  Info,
  FileText,
  FileSpreadsheet,
  Coins,
  Landmark,
  Link2,
  Bookmark
} from 'lucide-react'
import ExportPdfButton from './ExportPdfButton'

function BusinessNavSidebar({
  title = 'Business Registration',
  stateName = 'Maharashtra',
  completedCount = 2,
  totalCount = 8,
  activeTab = 'Roadmap',
  onTabChange,
  onSaveRoadmap,
  bookmarked = false,
  steps = [],
}) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const NAV_ITEMS = [
    { name: 'Roadmap', icon: Map },
    { name: 'Overview', icon: Info },
    { name: 'Documents', icon: FileText },
    { name: 'Forms', icon: FileSpreadsheet },
    { name: 'Fees', icon: Coins },
    { name: 'Departments', icon: Landmark },
    { name: 'Official Sources', icon: Link2 },
  ]

  // Circular gauge calculations
  const radius = 28
  const stroke = 5
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-serif-title font-bold text-[#1E293B]">
          {title}
        </h2>
        <p className="text-xs text-[#64748B] font-medium">{stateName}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onTabChange && onTabChange(item.name)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition text-left ${
                isActive
                  ? 'bg-[#FFF4F0] text-[#C84B24] border border-[#FADCD1] shadow-2xs'
                  : 'text-[#64748B] hover:bg-white hover:text-[#1E293B]'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? 'text-[#C84B24]' : 'text-[#94A3B8]'
                }`}
              />
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>


      {/* Bottom Progress & Save Widget Card */}
      <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-civic-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* SVG Circular Progress Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
              <circle
                stroke="#F1E7DA"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#C84B24"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-[#1E293B]">
              {percentage}%
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#1E293B]">Your Progress</h4>
            <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
              {completedCount} of {totalCount} steps completed
            </p>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-2 w-full rounded-full bg-[#F3EBE0] overflow-hidden">
          <div
            className="h-full bg-[#C84B24] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Save Roadmap Button */}
        <button
          type="button"
          onClick={onSaveRoadmap}
          className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-bold transition shadow-2xs ${
            bookmarked
              ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
              : 'border-[#E5D9C8] bg-[#FFFDF9] hover:bg-[#FAF7F2] text-[#C84B24]'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#166534]/20' : ''}`} />
          <span>{bookmarked ? 'Roadmap Saved' : 'Save Roadmap'}</span>
        </button>

        {/* Export to PDF */}
        <ExportPdfButton taskName={title} city={stateName} steps={steps} />
      </div>
    </div>
  )
}

export default BusinessNavSidebar
