import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Download } from "lucide-react";
import { useTruthReport } from "@/hooks/useLieDetectorAdvanced";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TruthReportCard = () => {
  const [paste, setPaste] = useState("");
  const [report, setReport] = useState<any>(null);
  const gen = useTruthReport();

  const run = () => {
    let payload: any;
    try {
      payload = JSON.parse(paste);
    } catch {
      payload = { raw_input: paste };
    }
    gen.mutate(
      { source_type: "manual", payload, title: "Truth Analysis Report" },
      { onSuccess: (d) => setReport(d.report) }
    );
  };

  const downloadPdf = () => {
    if (!report) return;
    const pdf = new jsPDF();
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(report.title || "Truth Analysis Report", margin, y);
    y += 10;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    const section = (title: string, body: string | string[]) => {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      if (y > 270) { pdf.addPage(); y = margin; }
      pdf.text(title, margin, y);
      y += 6;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const text = Array.isArray(body) ? body.map((b, i) => `${i + 1}. ${b}`).join("\n") : body;
      const lines = pdf.splitTextToSize(text || "—", pageW - margin * 2);
      lines.forEach((l: string) => {
        if (y > 280) { pdf.addPage(); y = margin; }
        pdf.text(l, margin, y);
        y += 5;
      });
      y += 4;
    };

    section("Executive Summary", report.executive_summary || "—");
    section("Key Findings", report.key_findings || []);
    section("Evidence Breakdown", report.evidence_breakdown || []);
    section("Risk Assessment", report.risk_assessment || "—");
    section("Recommended Actions", report.recommended_actions || []);
    section("Legal Disclaimer", report.legal_disclaimer || "");

    pdf.save(`truth-report-${Date.now()}.pdf`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Truth Report Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Truth Report Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Truth Report Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-emerald-950/30 via-card/60 to-card/60 backdrop-blur-md border-emerald-900/40 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-emerald-400" /> Truth Report PDF
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">5 cr</Badge>
        </div>
        <CardDescription className="text-xs">
          Generate a professional, court/HR-ready PDF from any analysis output.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Paste a previous JSON analysis result, or write a free-form summary of the situation…"
          rows={5}
          className="text-xs font-mono"
        />
        <Button
          onClick={run}
          disabled={gen.isPending || !paste.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
        >
          {gen.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Drafting report…</> : "Generate Report"}
        </Button>
        {report && (
          <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30 space-y-2 text-xs">
            <div className="font-bold text-emerald-300">{report.title}</div>
            <p className="text-foreground/85 line-clamp-3">{report.executive_summary}</p>
            <Button onClick={downloadPdf} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
              <Download className="h-3 w-3 mr-1" /> Download PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
