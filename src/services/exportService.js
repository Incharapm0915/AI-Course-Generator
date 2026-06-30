import jsPDF      from 'jspdf'
import html2canvas from 'html2canvas'

// Export course as PDF
export const exportCoursePDF = async (course) => {
  const pdf      = new jsPDF('p', 'mm', 'a4')
  const pageW    = pdf.internal.pageSize.getWidth()
  const pageH    = pdf.internal.pageSize.getHeight()
  const margin   = 20
  const contentW = pageW - margin * 2
  let   y        = margin

  // Helper — add new page if needed
  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) {
      pdf.addPage()
      y = margin
    }
  }

  // Helper — wrapped text
  const addText = (text, fontSize, isBold, color = [30, 30, 30]) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    pdf.setTextColor(...color)
    const lines = pdf.splitTextToSize(String(text || ''), contentW)
    checkPage(lines.length * (fontSize * 0.4 + 2))
    pdf.text(lines, margin, y)
    y += lines.length * (fontSize * 0.4 + 2)
  }

  const addSpacer = (h = 6) => { y += h }

  // ── Cover ──────────────────────────────────────────
  // Header bar
  pdf.setFillColor(99, 102, 241)
  pdf.rect(0, 0, pageW, 50, 'F')

  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('CourseAI', margin, 28)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('AI-Powered Learning', margin, 38)

  y = 70

  // Course title
  addText(course.title, 20, true, [30, 30, 30])
  addSpacer(4)

  // Description
  addText(course.description, 11, false, [80, 80, 80])
  addSpacer(8)

  // Meta pills
  pdf.setFillColor(238, 237, 254)
  pdf.setTextColor(79, 70, 229)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')

  const pills = [
    `Level: ${course.level || 'N/A'}`,
    `Duration: ${course.duration || 'N/A'}`,
    `Modules: ${course.modules?.length || 0}`,
  ]
  let pillX = margin
  pills.forEach((pill) => {
    const w = pdf.getTextWidth(pill) + 8
    pdf.roundedRect(pillX, y, w, 8, 2, 2, 'F')
    pdf.text(pill, pillX + 4, y + 5.5)
    pillX += w + 6
  })
  y += 16

  // Divider
  pdf.setDrawColor(230, 230, 230)
  pdf.setLineWidth(0.5)
  pdf.line(margin, y, pageW - margin, y)
  addSpacer(8)

  // ── Learning Outcomes ─────────────────────────────
  if (course.outcomes?.length > 0) {
    addText('Learning Outcomes', 14, true, [30, 30, 30])
    addSpacer(4)
    course.outcomes.forEach((outcome) => {
      checkPage(8)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(60, 60, 60)
      const lines = pdf.splitTextToSize(`• ${outcome}`, contentW - 6)
      pdf.text(lines, margin + 2, y)
      y += lines.length * 5 + 2
    })
    addSpacer(8)
  }

  // ── Modules & Lessons ─────────────────────────────
  addText('Course Content', 14, true, [30, 30, 30])
  addSpacer(6)

  course.modules?.forEach((mod, modIdx) => {
    checkPage(14)

    // Module header
    pdf.setFillColor(245, 245, 255)
    pdf.setDrawColor(199, 210, 254)
    pdf.roundedRect(margin, y - 4, contentW, 12, 3, 3, 'FD')

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(79, 70, 229)
    pdf.text(`Module ${modIdx + 1}: ${mod.title}`, margin + 4, y + 4)
    y += 14

    // Module description
    if (mod.description) {
      addText(mod.description, 9, false, [100, 100, 100])
      addSpacer(3)
    }

    // Lessons
    mod.lessons?.forEach((lesson, lesIdx) => {
      checkPage(20)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(40, 40, 40)
      pdf.text(
        `  ${modIdx + 1}.${lesIdx + 1}  ${lesson.title}`,
        margin, y
      )

      // Duration badge
      const dur   = lesson.duration || ''
      const durW  = pdf.getTextWidth(dur) + 6
      pdf.setFillColor(230, 255, 237)
      pdf.setTextColor(22, 163, 74)
      pdf.setFontSize(8)
      pdf.roundedRect(pageW - margin - durW, y - 4, durW, 6, 1, 1, 'F')
      pdf.text(dur, pageW - margin - durW + 3, y)
      y += 6

      // Lesson content
      if (lesson.content) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(80, 80, 80)
        const lines = pdf.splitTextToSize(lesson.content, contentW - 10)
        const show  = lines.slice(0, 4)
        checkPage(show.length * 4.5 + 4)
        pdf.text(show, margin + 6, y)
        y += show.length * 4.5 + 4
      }

      // Key points
      if (lesson.keyPoints?.length > 0) {
        checkPage(6)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(99, 102, 241)
        pdf.text('Key Points:', margin + 6, y)
        y += 5

        lesson.keyPoints.slice(0, 3).forEach((pt) => {
          checkPage(5)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(60, 60, 60)
          const lines = pdf.splitTextToSize(`  ✓ ${pt}`, contentW - 14)
          pdf.text(lines, margin + 8, y)
          y += lines.length * 4 + 1
        })
        addSpacer(3)
      }
    })
    addSpacer(6)
  })

  // ── Footer on last page ───────────────────────────
  checkPage(16)
  pdf.setDrawColor(230, 230, 230)
  pdf.line(margin, y, pageW - margin, y)
  addSpacer(6)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(150, 150, 150)
  pdf.text(
    `Generated by CourseAI  •  ${new Date().toLocaleDateString()}`,
    pageW / 2, y,
    { align: 'center' }
  )

  // Save
  const fileName = `${course.title?.replace(/[^a-z0-9]/gi, '_') || 'course'}.pdf`
  pdf.save(fileName)
}

// Generate shareable link
export const generateShareLink = (courseId) => {
  return `${window.location.origin}/course/${courseId}`
}