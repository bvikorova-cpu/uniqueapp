import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ListChecks, MessageCircleQuestion, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface HealthAnalysis {
  title: string;
  summary: string;
  key_findings: string[];
  severity: "low" | "medium" | "high";
  severity_reason?: string;
  plain_language: { term: string; meaning: string }[];
  next_steps: string[];
  doctor_questions: string[];
  scan_id?: string | null;
  credits_spent?: number;
  created_at?: string;
}

const SEVERITY: Record<HealthAnalysis["severity"], { label: string; className: string }> = {
  low: { label: "Low attention", className: "bg-green-500/15 text-green-700 dark:text-green-400" },
  medium: { label: "Medium attention", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  high: { label: "High attention", className: "bg-destructive/15 text-destructive" },
};

export const HealthResultCard = ({ result }: { result: HealthAnalysis }) => {
  const severity = SEVERITY[result.severity] ?? SEVERITY.low;

  const exportPdf = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      const write = (text: string, size = 11, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, width);
        for (const line of lines) {
          if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += size + 4;
        }
        y += 4;
      };

      write(result.title || "Health analysis", 16, true);
      write(`Attention level: ${severity.label}`, 11, true);
      if (result.summary) { write("Summary", 13, true); write(result.summary); }
      if (result.key_findings?.length) {
        write("Key findings", 13, true);
        result.key_findings.forEach((f) => write(`• ${f}`));
      }
      if (result.plain_language?.length) {
        write("Medical terms in plain language", 13, true);
        result.plain_language.forEach((p) => write(`• ${p.term}: ${p.meaning}`));
      }
      if (result.next_steps?.length) {
        write("Next steps", 13, true);
        result.next_steps.forEach((s) => write(`• ${s}`));
      }
      if (result.doctor_questions?.length) {
        write("Questions to ask your doctor", 13, true);
        result.doctor_questions.forEach((q) => write(`• ${q}`));
      }
      write(
        "Informačný nástroj: AI výstupy slúžia výhradne na edukačné a preventívne účely a nenahrádzajú odbornú lekársku diagnostiku.",
        9,
      );
      doc.save(`health-analysis-${Date.now()}.pdf`);
    } catch {
      toast.error("Could not create the PDF");
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-black">{result.title}</h2>
          <Badge className={severity.className}>{severity.label}</Badge>
        </div>

        {result.summary && <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>}
        {result.severity_reason && (
          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">{result.severity_reason}</p>
        )}

        {result.key_findings?.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><ListChecks className="h-4 w-4 text-primary" /> Key findings</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.key_findings.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>
        )}

        {result.plain_language?.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-primary" /> In plain language</h3>
            <dl className="space-y-2 text-sm">
              {result.plain_language.map((p, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <dt className="font-semibold">{p.term}</dt>
                  <dd className="text-muted-foreground">{p.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {result.next_steps?.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-bold">Next steps</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.next_steps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}

        {result.doctor_questions?.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><MessageCircleQuestion className="h-4 w-4 text-primary" /> Questions to ask your doctor</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.doctor_questions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" onClick={exportPdf}>
            <Download className="mr-2 h-4 w-4" /> Export result to PDF
          </Button>
          <span className="self-center text-xs text-muted-foreground">Saved to your history automatically</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthResultCard;
