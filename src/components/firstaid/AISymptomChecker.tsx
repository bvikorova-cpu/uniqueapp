import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Stethoscope, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AISymptomChecker({ onBack }: Props) {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!symptoms.trim()) { toast.error("Please describe your symptoms"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are an AI first aid symptom checker. A user describes: "${symptoms}". Severity: ${severity}. Provide: 1) Possible conditions (NOT a diagnosis), 2) Immediate first aid steps, 3) When to call emergency services, 4) Self-care tips. Add DISCLAIMER: This is NOT medical advice.`
        }
      });
      if (error) throw error;
      setResult(data?.message || "No result");
    } catch { toast.error("Analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Symptom Checker - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Symptom Checker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Symptom Checker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-red-500" />AI Symptom Checker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
              This tool provides general first aid guidance only. Always consult a medical professional. In emergencies, call 112.
            </AlertDescription>
          </Alert>
          <Textarea placeholder="Describe symptoms in detail..." value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4} />
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe - Consider calling 112</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={analyze} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : "Analyze Symptoms (3 Credits)"}
          </Button>
          {result && <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
