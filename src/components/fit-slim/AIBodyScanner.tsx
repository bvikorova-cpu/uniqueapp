import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ScanLine, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function AIBodyScanner({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ age: "", gender: "", height: "", weight: "", waist: "", hip: "" });

  const scan = async () => {
    if (!form.age || !form.gender || !form.height || !form.weight) return toast.error("Fill required fields");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          message: `Perform a comprehensive body composition analysis:
Age: ${form.age}, Gender: ${form.gender}, Height: ${form.height}cm, Weight: ${form.weight}kg
${form.waist ? `Waist: ${form.waist}cm` : ""} ${form.hip ? `Hip: ${form.hip}cm` : ""}
Calculate: BMI, estimated body fat %, lean mass, BMR, TDEE.
Provide: body type classification, health risk assessment, ideal weight range.
Give 5 specific recommendations for improvement. Use clear sections with emojis.`,
        },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");
    } catch (e: any) {
      toast.error(e.message || "Error scanning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Body Scanner - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Body Scanner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Body Scanner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-violet-500" /> AI Body Composition Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><Label>Age *</Label><Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
            <div><Label>Gender *</Label>
              <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Height (cm) *</Label><Input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
            <div><Label>Weight (kg) *</Label><Input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
            <div><Label>Waist (cm)</Label><Input type="number" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} /></div>
            <div><Label>Hip (cm)</Label><Input type="number" value={form.hip} onChange={e => setForm({...form, hip: e.target.value})} /></div>
          </div>
          <Button onClick={scan} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</> : <><Sparkles className="h-4 w-4 mr-2" /> Full Body Scan (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-violet-500/5 border-violet-500/20 mt-4">
              <CardContent className="p-4 whitespace-pre-line text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
