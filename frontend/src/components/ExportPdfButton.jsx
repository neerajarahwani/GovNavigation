import { useState } from 'react'
import jsPDF from 'jspdf'
// Using html2canvas-pro, not html2canvas — the original doesn't understand
// modern CSS color functions like oklch(), which Tailwind CSS v4 uses
// throughout its default palette, and silently fails to capture anything.
import html2canvas from 'html2canvas-pro'

// jsPDF's built-in fonts don't support the ₹ (Indian Rupee) character — it
// renders as a garbled superscript glyph and throws off the whole line's
// spacing. Swap it for plain "Rs." before any text reaches jsPDF.
function sanitizeForPdf(text) {
  return typeof text === 'string' ? text.replace(/₹/g, 'Rs. ') : text
}

// Finds each canRunParallelWith pair once (not twice, once from each side).
function findParallelPairs(steps) {
  const byId = new Map(steps.map((s) => [s.stepId, s]))
  const pairs = []
  for (const step of steps) {
    for (const partnerId of step.canRunParallelWith || []) {
      const partner = byId.get(String(partnerId))
      if (partner && step.stepId < partner.stepId) {
        pairs.push([step.name, partner.name])
      }
    }
  }
  return pairs
}

// Downloads the currently-visible roadmap (graph image + step details) as a
// PDF. Reads whatever's already on screen — no new backend call, and it
// naturally reflects any document-shortcut filtering already applied.
function ExportPdfButton({ task, steps }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDownload() {
    setIsGenerating(true)
    setErrorMessage('')
    try {
      const graphEl = document.getElementById('roadmap-graph-capture')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth() - 80

      doc.setFontSize(16)
      doc.text(task.title, 40, 40)
      doc.setFontSize(11)
      doc.text(task.city, 40, 58)

      let cursorY = 80
      if (graphEl) {
        const canvas = await html2canvas(graphEl)
        const imgData = canvas.toDataURL('image/png')
        const imgHeight = (canvas.height / canvas.width) * pageWidth
        doc.addImage(imgData, 'PNG', 40, cursorY, pageWidth, imgHeight)
        cursorY += imgHeight + 14

        // Explain how to read the diagram — solid arrows vs. the dashed
        // parallel connector — right under the image itself.
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text(
          'How to read this: a dark gray arrow means "finish this step, then do the next ' +
            'one." A green dashed line means the two connected steps can be done at the same time.',
          40,
          cursorY,
          { maxWidth: pageWidth }
        )
        doc.setTextColor(0)
        cursorY += 26
      }

      const parallelPairs = findParallelPairs(steps)
      if (parallelPairs.length > 0) {
        doc.setFontSize(12)
        doc.text('Steps you can do at the same time:', 40, cursorY)
        cursorY += 16
        doc.setFontSize(10)
        for (const [a, b] of parallelPairs) {
          doc.text(`- ${a}  +  ${b}`, 48, cursorY, { maxWidth: pageWidth - 8 })
          cursorY += 14
        }
        cursorY += 10
      }

      for (const step of steps) {
        if (cursorY > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage()
          cursorY = 40
        }
        const hasRealSource = typeof step.sourceUrl === 'string' && step.sourceUrl.startsWith('http')

        doc.setFontSize(13)
        doc.text(sanitizeForPdf(step.name), 40, cursorY)
        cursorY += 16

        doc.setFontSize(10)
        const lines = [
          `Department: ${step.department || 'Not specified'}`,
          `Documents: ${(step.documents || []).join(', ') || 'Not specified'}`,
          `Fees: ${sanitizeForPdf(step.fees) || 'Not specified'}`,
          `Eligibility: ${step.eligibility || 'Not specified'}`,
          `Estimated time: ${step.estimatedDays ? `${step.estimatedDays} day(s)` : 'Not specified'}`,
          `Source: ${hasRealSource ? step.sourceUrl : 'Not yet verified'}`,
        ]
        for (const line of lines) {
          doc.text(sanitizeForPdf(line), 40, cursorY, { maxWidth: pageWidth })
          cursorY += 14
        }
        cursorY += 10
      }

      const filename = `${task.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-roadmap.pdf`
      doc.save(filename)
    } catch (err) {
      setErrorMessage('Could not generate the PDF — please try again.')
      console.error('PDF export failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
      >
        {isGenerating ? 'Generating…' : 'Download as PDF'}
      </button>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  )
}

export default ExportPdfButton
