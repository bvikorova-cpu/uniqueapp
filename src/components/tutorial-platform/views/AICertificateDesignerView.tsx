import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Loader2, Download, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 5;

const STYLE_THEMES: Record<string, {
  title: string; frame: string; bg: string; icon: string; heading: string;
  name: string; course: string; corners: boolean; cornerColor: string;
}> = {
  classic: {
    title: "Certificate of Completion",
    frame: "border-4 border-double border-amber-600/50",
    bg: "bg-[#fdfaf1] dark:bg-amber-950/20",
    icon: "text-amber-600",
    heading: "font-serif tracking-wide text-amber-900 dark:text-amber-200",
    name: "font-serif text-amber-950 dark:text-amber-100",
    course: "font-serif italic",
    corners: true,
    cornerColor: "text-amber-500/40",
  },
  modern: {
    title: "CERTIFICATE OF ACHIEVEMENT",
    frame: "border-l-8 border-primary",
    bg: "bg-background",
    icon: "text-primary",
    heading: "font-sans uppercase tracking-[0.25em] text-sm md:text-base",
    name: "font-sans tracking-tight",
    course: "font-sans font-medium text-muted-foreground",
    corners: false,
    cornerColor: "",
  },
  elegant: {
    title: "Certificate of Excellence",
    frame: "border-2 border-yellow-500/70 ring-4 ring-yellow-500/20 ring-offset-2 ring-offset-background",
    bg: "bg-gradient-to-br from-yellow-50 via-amber-100/60 to-yellow-50 dark:from-yellow-950/30 dark:to-amber-900/20",
    icon: "text-yellow-600",
    heading: "font-serif italic text-yellow-800 dark:text-yellow-200",
    name: "font-serif bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent",
    course: "font-serif",
    corners: true,
    cornerColor: "text-yellow-500/50",
  },
  tech: {
    title: "CERTIFIED COMPLETION",
    frame: "border border-cyan-500/50 shadow-[0_0_30px_-10px_hsl(190_90%_50%/0.5)]",
    bg: "bg-slate-950 text-slate-100",
    icon: "text-cyan-400",
    heading: "font-mono uppercase tracking-widest text-cyan-300",
    name: "font-mono text-cyan-100",
    course: "font-mono text-cyan-400",
    corners: false,
    cornerColor: "",
  },
};

interface Props { onBack: () => void; }


export function AICertificateDesignerView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct, refund } = useTutorialAICredits();
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [style, setStyle] = useState("classic");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<string | null>(null);

  const generateCertificate = async () => {
    if (!studentName.trim() || !courseName.trim()) {
      toast({ title: "Missing Info", description: "Fill in all fields", variant: "destructive" });
      return;
    }
    const creditOk = await checkAndDeduct(CREDITS_COST);
    if (!creditOk) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'design-certificate', studentName, courseName, style }
      });
      if (error) throw error;
      setCertificate(data.result);
      toast({ title: "Certificate Designed!", description: "5 credits used" });
    } catch (err: any) {
      await refund(CREDITS_COST);
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    const el = certRef.current;
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxW = pw - margin * 2;
      const maxH = ph - margin * 2;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
      pdf.save(`Certificate_${studentName.replace(/\s+/g, "_") || "Student"}.pdf`);
      toast({ description: "Certificate PDF downloaded" });
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Try again", variant: "destructive" });
    }
  };





  return (
    <>
      <FloatingHowItWorks title={"A I Certificate Designer View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Certificate Designer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Certificate Designer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Certificate Designer</h2>
            <p className="text-muted-foreground">Create beautiful certificates for your students</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-amber-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Student Name</label>
              <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g., Jane Doe" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Course Name</label>
              <Input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g., Advanced Web Development" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Certificate Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                <option value="classic">Classic Academic</option>
                <option value="modern">Modern Minimal</option>
                <option value="elegant">Elegant Gold</option>
                <option value="tech">Tech Professional</option>
              </select>
            </div>
            <Button onClick={generateCertificate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing...</> : <><Award className="w-4 h-4 mr-2" />Design Certificate (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {certificate && (
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div ref={certRef} className={`rounded-2xl p-6 md:p-10 text-center space-y-3 relative overflow-hidden ${theme.frame} ${theme.bg}`}>
                {theme.corners && (
                  <>
                    <div className="absolute top-3 left-3"><Star className={`w-5 h-5 ${theme.cornerColor}`} /></div>
                    <div className="absolute top-3 right-3"><Star className={`w-5 h-5 ${theme.cornerColor}`} /></div>
                    <div className="absolute bottom-3 left-3"><Star className={`w-5 h-5 ${theme.cornerColor}`} /></div>
                    <div className="absolute bottom-3 right-3"><Star className={`w-5 h-5 ${theme.cornerColor}`} /></div>
                  </>
                )}

                <Award className={`w-16 h-16 mx-auto drop-shadow-lg ${theme.icon}`} />
                <h3 className={`text-2xl md:text-3xl font-bold ${theme.heading}`}>{theme.title}</h3>
                <p className="text-muted-foreground text-sm">This certifies that</p>
                <p className={`text-2xl md:text-3xl font-black ${theme.name}`}>{studentName}</p>
                <p className="text-muted-foreground text-sm">has successfully completed</p>
                <p className={`text-lg md:text-xl font-bold ${theme.course}`}>{courseName}</p>
                <p className="text-sm text-muted-foreground mt-4">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-muted-foreground pt-2">Issued by Unique Tutorial Platform</p>
              </div>
              <Button className="w-full mt-4 h-11" variant="outline" onClick={downloadPdf}>
                <Download className="w-4 h-4 mr-2" />Download PDF
              </Button>


            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}