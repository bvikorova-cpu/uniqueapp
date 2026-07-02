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

interface Props { onBack: () => void; }

export function AICertificateDesignerView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
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
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
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
          <Card className="border-amber-500/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="border-4 border-double border-amber-500/40 rounded-2xl p-6 md:p-10 bg-gradient-to-br from-amber-50/60 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10 text-center space-y-3 relative overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute top-3 left-3"><Star className="w-5 h-5 text-amber-400/30" /></div>
                <div className="absolute top-3 right-3"><Star className="w-5 h-5 text-amber-400/30" /></div>
                <div className="absolute bottom-3 left-3"><Star className="w-5 h-5 text-amber-400/30" /></div>
                <div className="absolute bottom-3 right-3"><Star className="w-5 h-5 text-amber-400/30" /></div>
                
                <Award className="w-16 h-16 text-amber-500 mx-auto drop-shadow-lg" />
                <h3 className="text-2xl md:text-3xl font-serif font-bold">Certificate of Completion</h3>
                <p className="text-muted-foreground text-sm">This certifies that</p>
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{studentName}</p>
                <p className="text-muted-foreground text-sm">has successfully completed</p>
                <p className="text-lg md:text-xl font-bold">{courseName}</p>
                <p className="text-sm text-muted-foreground mt-4">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs mt-4 text-muted-foreground">{certificate}</div>
              </div>
              <Button className="w-full mt-4 h-11" variant="outline" onClick={() => {
                const content = `===== CERTIFICATE OF COMPLETION =====\n\nAwarded to: ${studentName}\nCourse: ${courseName}\nStyle: ${style}\nDate: ${new Date().toLocaleDateString()}\n\n${certificate}\n\nIssued by Unique Tutorial Platform\n`;
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Certificate_${studentName.replace(/\s+/g, "_") || "Student"}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast({ description: "Certificate downloaded" });
              }}><Download className="w-4 h-4 mr-2" />Download Certificate</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}