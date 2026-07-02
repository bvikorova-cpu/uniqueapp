import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Siren, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const SCENARIOS = [
  "Car accident", "Heart attack", "Severe bleeding", "Drowning", "Electric shock",
  "Poisoning", "Allergic reaction (anaphylaxis)", "Seizure", "Heatstroke", "Hypothermia",
  "Snake bite", "Broken bone", "Severe burn", "Choking child", "Unconscious person"
];

export function AIEmergencyGuide({ onBack }: Props) {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!scenario) { toast.error("Select a scenario"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are an emergency first aid expert. Generate a STEP-BY-STEP emergency response guide for: "${scenario}". Include: 1) Immediate actions (first 60 seconds), 2) Detailed procedure, 3) What NOT to do, 4) When professional help is critical, 5) Recovery position if applicable. Be concise and actionable.`
        }
      });
      if (error) throw error;
      setResult(data?.message || "No result");
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Emergency Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Emergency Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Emergency Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Siren className="w-5 h-5 text-red-500" />AI Emergency Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger><SelectValue placeholder="Select emergency scenario..." /></SelectTrigger>
            <SelectContent>
              {SCENARIOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate Guide (3 Credits)"}
          </Button>
          {result && <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
