import jsPDF from "jspdf";
import type { ChatMessage } from "@/hooks/useAnonymousChat";

export function exportChatToPDF(opts: {
  messages: ChatMessage[];
  currentUserId: string;
  myName: string;
  partnerName: string;
  matchCreatedAt?: string;
}) {
  const { messages, currentUserId, myName, partnerName, matchCreatedAt } = opts;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  let y = margin;

  // Header
  doc.setFillColor(120, 50, 200);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Anonymous Date — Chat Memory", margin, 38);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${myName}  ❤  ${partnerName}`, margin, 58);
  if (matchCreatedAt) {
    doc.text(`Started ${new Date(matchCreatedAt).toLocaleDateString()}`, pageW - margin - 150, 58);
  }
  y = 110;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);

  for (const m of messages) {
    const mine = m.sender_id === currentUserId;
    const sender = mine ? myName : partnerName;
    const time = m.created_at ? new Date(m.created_at).toLocaleString() : "";
    const text = m.message_type === "voice" ? "🎤 Voice message" : m.content;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(mine ? 120 : 230, mine ? 50 : 80, mine ? 200 : 130);
    doc.text(`${sender}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(time, margin + 100, y);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    y += 14;
    for (const line of lines) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin + 10, y);
      y += 13;
    }
    y += 6;
  }

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${i} / ${pages}  ·  Anonymous Date`, pageW / 2, pageH - 20, { align: "center" });
  }

  doc.save(`anonymous-date-${myName}-${partnerName}-${Date.now()}.pdf`);
}
