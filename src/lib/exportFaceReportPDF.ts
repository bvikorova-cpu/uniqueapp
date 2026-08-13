import jsPDF from "jspdf";

export type FaceReport = {
  headline: string;
  summary: string;
  report: string;
  mode: string;
  scores: Record<string, number>;
  traits: { label: string; value: string }[];
  created_at?: string;
};

/** Renders a Face Insight report into a clean, readable A4 PDF. */
export function exportFaceReportPDF(data: FaceReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ---- Cover ----
  doc.setFillColor(88, 28, 170);
  doc.rect(0, 0, pageW, 220, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Face Insight Studio", margin, 90);
  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(data.headline, contentW), margin, 130);
  doc.setFontSize(10);
  const dateLabel = new Date(data.created_at ?? Date.now()).toLocaleDateString();
  doc.text(`${data.mode.toUpperCase()} REPORT  •  ${dateLabel}`, margin, 190);

  let y = 260;
  doc.setTextColor(30, 30, 40);

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  if (data.summary) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(data.summary, contentW);
    ensureSpace(lines.length * 15);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 14;
  }

  const scores = Object.entries(data.scores ?? {});
  if (scores.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    ensureSpace(24);
    doc.text("Scores", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const [key, value] of scores) {
      ensureSpace(18);
      const label = key.replace(/_/g, " ");
      doc.text(`${label}: ${value}/100`, margin, y);
      const barX = margin + 180;
      const barW = contentW - 180;
      doc.setDrawColor(220, 220, 230);
      doc.setFillColor(238, 238, 246);
      doc.rect(barX, y - 8, barW, 8, "F");
      doc.setFillColor(88, 28, 170);
      doc.rect(barX, y - 8, (barW * Math.min(100, Number(value) || 0)) / 100, 8, "F");
      y += 16;
    }
    y += 8;
  }

  if (data.traits?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    ensureSpace(24);
    doc.text("Key traits", margin, y);
    y += 16;
    doc.setFontSize(10);
    for (const t of data.traits) {
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${t.label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(String(t.value), contentW - 130), margin + 120, y);
      y += 16;
    }
    y += 10;
  }

  // ---- Report body (lightweight markdown rendering) ----
  for (const rawLine of data.report.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      y += 8;
      continue;
    }
    const heading = /^#{2,3}\s+/.test(line);
    const bullet = /^[-*]\s+/.test(line);
    const text = line.replace(/^#{1,6}\s+/, "").replace(/^[-*]\s+/, "• ").replace(/\*\*/g, "");

    doc.setFont("helvetica", heading ? "bold" : "normal");
    doc.setFontSize(heading ? 13 : 10.5);
    const lines = doc.splitTextToSize(text, bullet ? contentW - 12 : contentW);
    ensureSpace(lines.length * (heading ? 18 : 14) + (heading ? 10 : 0));
    if (heading) y += 8;
    doc.text(lines, bullet ? margin + 12 : margin, y);
    y += lines.length * (heading ? 18 : 14) + (heading ? 4 : 2);
  }

  doc.save(`face-insight-${data.mode}-${Date.now()}.pdf`);
}
