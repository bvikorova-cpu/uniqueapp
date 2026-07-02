import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  entries: any[];
  audience: "school" | "lawyer" | "police";
}

export function JournalExportPDF({ entries, audience }: Props) {
  const exportPdf = () => {
    if (!entries || entries.length === 0) {
      toast.error("No journal entries to export");
      return;
    }
    const doc = new jsPDF();
    const audienceTitle = { school: "School Administration", lawyer: "Legal Counsel", police: "Law Enforcement" }[audience];
    let y = 20;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Bullying Incident Report", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Prepared for: ${audienceTitle}`, 20, y);
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 5;
    doc.text(`Total incidents: ${entries.length}`, 20, y);
    y += 10;
    doc.setDrawColor(180);
    doc.line(20, y, 190, y);
    y += 8;

    entries.forEach((e, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Incident #${i + 1} — ${e.incident_type || "Unspecified"}`, 20, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Date: ${new Date(e.created_at).toLocaleString()}`, 20, y);
      y += 4;
      if (e.location) { doc.text(`Location: ${e.location}`, 20, y); y += 4; }
      if (e.witnesses) { doc.text(`Witnesses: ${e.witnesses}`, 20, y); y += 4; }
      if (e.mood_rating != null) { doc.text(`Reporter mood: ${e.mood_rating}/10`, 20, y); y += 4; }
      const lines = doc.splitTextToSize(`Description: ${e.description || "—"}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 4 + 6;
    });

    doc.save(`bullying-report-${audience}-${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  return (
    <>
      <FloatingHowItWorks title={"Journal Export P D F - How it works"} steps={[{ title: 'Open', desc: 'Access the Journal Export P D F section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Journal Export P D F.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button size="sm" variant="outline" onClick={exportPdf} className="gap-1">
      <Download className="h-3 w-3" /> Export for {audience}
    </Button>
    </>
  );
}
