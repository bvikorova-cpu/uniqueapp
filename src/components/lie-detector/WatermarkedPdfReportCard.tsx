import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileBadge2, Download, ShieldCheck, Copy } from "lucide-react";
import jsPDF from "jspdf";
import { useRegisterVerification } from "@/hooks/useLieDetectorTuning";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const WatermarkedPdfReportCard = () => {
  const [title, setTitle] = useState("Lie Detector Report");
  const [summary, setSummary] = useState("");
  const [score, setScore] = useState(72);
  const [token, setToken] = useState<string | null>(null);
  const reg = useRegisterVerification();

  const verifyUrl = (t: string) => `${window.location.origin}/verify-report?token=${t}`;

  const generate = async () => {
    if (!summary.trim()) return toast.error("Add a summary first");
    const v = await reg.mutateAsync({ title, summary, truthfulness_score: score });
    const t: string = v.token;
    setToken(t);

    const doc = new jsPDF();
    // Watermark
    doc.setTextColor(220);
    doc.setFontSize(60);
    for (let y = 40; y < 280; y += 60) {
      for (let x = -20; x < 200; x += 80) {
        doc.text("VERIFIED", x, y, { angle: 30 });
      }
    }
    // Header
    doc.setTextColor(20);
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("LIE DETECTOR — TRUTH REPORT", 20, 22);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Title: ${title}`, 20, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38);
    doc.text(`Verification Token: ${t}`, 20, 44);
    doc.text(`Truthfulness Score: ${score}/100`, 20, 50);
    doc.line(20, 56, 190, 56);

    // Summary block
    doc.setFont("helvetica", "bold"); doc.text("Analysis Summary", 20, 66);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(summary, 170);
    doc.text(lines, 20, 74);

    // QR
    const qr = document.getElementById("verify-qr-canvas") as HTMLCanvasElement | null;
    if (qr) {
      const dataUrl = qr.toDataURL("image/png");
      doc.addImage(dataUrl, "PNG", 145, 240, 45, 45);
    }
    doc.setFontSize(8);
    doc.text(`Verify at: ${verifyUrl(t)}`, 20, 285);
    doc.save(`lie-detector-${t}.pdf`);
    toast.success("Watermarked PDF downloaded");
  };

  return (
    <>
      <FloatingHowItWorks title={"Watermarked Pdf Report Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Watermarked Pdf Report Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Watermarked Pdf Report Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-emerald-950/40 via-card/80 to-amber-950/30 border-emerald-500/30 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileBadge2 className="w-4 h-4 text-emerald-300" />
          Watermarked PDF + QR
          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40 text-[10px]">FREE</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Court-ready PDF with VERIFIED watermark + QR code linking to public verification.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Report title" className="bg-background/40 border-emerald-500/20" />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Paste your analysis summary..."
          className="w-full min-h-[100px] p-2 rounded-md bg-background/40 border border-emerald-500/20 text-sm font-mono"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Truthfulness:</span>
          <input
            type="range" min={0} max={100} value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
          <span className="text-sm font-bold text-emerald-300 w-10 text-right">{score}</span>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700"
          disabled={reg.isPending}
          onClick={generate}
        >
          <Download className="w-4 h-4 mr-2" />
          {reg.isPending ? "Generating..." : "Generate Watermarked PDF"}
        </Button>

        {token && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-mono text-emerald-100">Verification token: {token}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6 ml-auto" onClick={() => { navigator.clipboard.writeText(verifyUrl(token)); toast.success("URL copied"); }}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center justify-center bg-white p-2 rounded">
              <QRCodeSVG id="verify-qr-canvas" value={verifyUrl(token)} size={120} includeMargin />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
