import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import { usePdfReport } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { analysisId: string; source?: "main" | "signature" | "forgery" | "compatibility"; }

export const PdfReportButton = ({ analysisId, source = "main" }: Props) => {
  const m = usePdfReport();

  const exportPdf = async () => {
    const data: any = await m.mutateAsync({ analysisId, source });
    const blob = await fetch("data:application/pdf;base64," + btoa(buildPdf(data)))
      .then(r => r.blob()).catch(() => null);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `handwriting-forensic-report-${Date.now()}.pdf`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <FloatingHowItWorks title={"Pdf Report Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Pdf Report Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pdf Report Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button onClick={exportPdf} disabled={m.isPending} variant="outline" className="gap-2 border-amber-700/40">
      {m.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      Export Forensic PDF <Badge variant="secondary" className="ml-1">5 cr</Badge>
    </Button>
    </>
  );
};

// Minimal PDF generator (single page text). For richer styling use jsPDF, but stays lightweight.
function buildPdf(d: any) {
  const text = `Handwriting Forensic Report\n\nWatermark: ${d.watermark}\n\n${d.summary}\n\nSource ID: ${d.report?.id}`;
  // Very simple stream — most PDF readers will display it
  const stream = `BT /F1 12 Tf 50 750 Td (${text.replace(/\n/g, ") Tj 0 -16 Td (").replace(/[()]/g, "")}) Tj ET`;
  return `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${stream.length}>>stream
${stream}
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref 0 6
0000000000 65535 f
trailer<</Size 6/Root 1 0 R>>
%%EOF`;
}
