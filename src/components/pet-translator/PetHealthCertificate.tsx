import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Loader2, Sparkles, ArrowLeft, Download, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetHealthCertificate({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState({ pet_name: "", breed: "", age: "", weight: "", vaccinations: "", conditions: "" });

  const handleGenerate = async () => {
    if (!form.pet_name || !form.breed) { toast.error("Please fill in pet name and breed"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
        body: { action: "health_certificate", ...form },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Certificate generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Health Certificate works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">🏥 Pet Health Certificate</CardTitle>
          <p className="text-muted-foreground">Generate a professional AI health report for your pet</p>
          <Badge className="w-fit mx-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" /> 6 Credits
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Pet name" value={form.pet_name} onChange={e => setForm(p => ({ ...p, pet_name: e.target.value }))} />
            <Input placeholder="Breed" value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} />
            <Input placeholder="Age" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
            <Input placeholder="Weight (kg)" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
          </div>
          <Input placeholder="Vaccinations (comma-separated)" value={form.vaccinations} onChange={e => setForm(p => ({ ...p, vaccinations: e.target.value }))} />
          <Textarea placeholder="Known health conditions or notes..." value={form.conditions} onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))} rows={2} />
          <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><FileText className="h-4 w-4 mr-2" /> Generate Certificate</>}
          </Button>
          {result && (
            <Card className="bg-card/80 border-emerald-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-400" /> Health Certificate</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none border-t border-border pt-4">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
}
