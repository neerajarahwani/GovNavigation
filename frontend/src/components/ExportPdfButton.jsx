import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

function ExportPdfButton({ taskName, city, steps }) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (!steps || steps.length === 0) return
    setIsExporting(true)

    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF } = await import('jspdf')

      const graphEl = document.getElementById('roadmap-graph-capture')

      let canvas = null
      if (graphEl) {
        canvas = await html2canvas(graphEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
          logging: false,
        })
      }

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let y = margin

      // Header Banner
      doc.setFillColor(79, 70, 229) // Indigo-600
      doc.rect(0, 0, pageWidth, 28, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('CivicPath - Government Action Plan', margin, 18)

      y = 36

      // Title & Subtitle
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Service: ${taskName || 'Custom Civic Process'}`, margin, y)
      y += 6

      if (city) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text(`Location: ${city}`, margin, y)
        y += 6
      }

      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8

      // Flowchart Image
      if (canvas) {
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (y + imgHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }

        doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight)
        y += imgHeight + 10
      }

      // Steps Listing
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)

      if (y + 10 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }

      doc.text('Detailed Step Checklist & Information', margin, y)
      y += 8

      steps.forEach((s, idx) => {
        const blockHeight = 30
        if (y + blockHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }

        // Step card background
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F')
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'D')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(`${idx + 1}. ${s.name}`, margin + 4, y + 7)

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)

        const dept = s.department ? `Department: ${s.department}` : ''
        const days = s.estimatedDays ? `Est. Time: ${s.estimatedDays} day(s)` : ''
        const fee = s.fees ? `Fees: ${s.fees}` : ''
        const metaLine = [dept, days, fee].filter(Boolean).join('  |  ')

        if (metaLine) {
          doc.text(metaLine, margin + 4, y + 13)
        }

        if (s.documents && s.documents.length > 0) {
          doc.text(`Required Documents: ${s.documents.join(', ')}`, margin + 4, y + 19)
        }

        y += 28
      })

      // Footer
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(148, 163, 184)
        doc.text(
          `CivicPath Government Navigator - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )
      }

      const fileName = `CivicPath_${(taskName || 'Roadmap').replace(/\s+/g, '_')}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 transition active:scale-95"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating PDF Report…</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          <span>Download PDF Action Plan</span>
        </>
      )}
    </button>
  )
}

export default ExportPdfButton
