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
      const { default: autoTable } = await import('jspdf-autotable')

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
      doc.text('JanDisha - Government Action Plan', margin, 18)

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

      // Steps Listing — autoTable measures each row's real wrapped height
      // (long department names, long document lists, etc.) and starts a new
      // page itself, so a row can never overlap the one after it the way
      // fixed-height manual boxes did.
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)

      if (y + 10 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }

      doc.text('Detailed Step Checklist & Information', margin, y)
      y += 4

      const tableRows = steps.map((s, idx) => {
        const documentNames = (s.documents || [])
          .map((d) => (typeof d === 'string' ? d : d.name))
          .join(', ')
        return [
          `${idx + 1}. ${s.name}`,
          s.department || '',
          s.estimatedDays ? `${s.estimatedDays} day(s)` : '',
          s.fees || '',
          documentNames,
        ]
      })

      autoTable(doc, {
        startY: y + 2,
        margin: { left: margin, right: margin },
        head: [['Step', 'Department', 'Est. Time', 'Fees', 'Required Documents']],
        body: tableRows,
        styles: { fontSize: 8.5, cellPadding: 3, valign: 'top', overflow: 'linebreak' },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold' },
          1: { cellWidth: 32 },
          2: { cellWidth: 18 },
          3: { cellWidth: 28 },
          4: { cellWidth: 'auto' },
        },
      })

      // Footer — page numbers on every page, including ones drawn before
      // and by autoTable.
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(148, 163, 184)
        doc.text(
          `JanDisha Government Navigator - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )
      }

      const fileName = `JanDisha_${(taskName || 'Roadmap').replace(/\s+/g, '_')}.pdf`
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
      className="flex items-center justify-center gap-2 rounded-xl border border-[#E5D9C8] bg-[#FFFDF9] hover:bg-[#FAF7F2] py-2.5 px-3 text-xs font-bold text-[#1E293B] transition shadow-2xs disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating PDF…</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          <span>Export to PDF</span>
        </>
      )}
    </button>
  )
}

export default ExportPdfButton
