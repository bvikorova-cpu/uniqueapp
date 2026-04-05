import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export function AICertificateDesignerView({ onBack }: Props) {
  const { toast } = useToast();
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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-amber-500" />
          <div>
            <h2 className="text-2xl font-black">AI Certificate Designer</h2>
            <p className="text-muted-foreground">Create beautiful certificates for your students</p>
          </div>
          <Badge className="ml-auto bg-amber-500/10 text-amber-500">5 Credits</Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Student Name</label>
              <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g., Jane Doe" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Course Name</label>
              <Input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g., Advanced Web Development" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Certificate Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="classic">Classic Academic</option>
                <option value="modern">Modern Minimal</option>
                <option value="elegant">Elegant Gold</option>
                <option value="tech">Tech Professional</option>
              </select>
            </div>
            <Button onClick={generateCertificate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing...</> : <><Award className="w-4 h-4 mr-2" />Design Certificate (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {certificate && (
          <Card>
            <CardContent className="pt-6">
              <div className="border-4 border-double border-amber-500/30 rounded-xl p-8 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 text-center space-y-4">
                <Award className="w-16 h-16 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-serif font-bold">Certificate of Completion</h3>
                <p className="text-muted-foreground">This certifies that</p>
                <p className="text-3xl font-bold text-emerald-600">{studentName}</p>
                <p className="text-muted-foreground">has successfully completed</p>
                <p className="text-xl font-semibold">{courseName}</p>
                <p className="text-sm text-muted-foreground mt-4">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs mt-4 text-muted-foreground">{certificate}</div>
              </div>
              <Button className="w-full mt-4" variant="outline"><Download className="w-4 h-4 mr-2" />Download Certificate</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
