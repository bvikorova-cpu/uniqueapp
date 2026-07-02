import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HeartPulse, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AICPRCoach({ onBack }: Props) {
  const [patient, setPatient] = useState("adult");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are an expert CPR instructor. Provide a comprehensive, step-by-step CPR coaching guide for: Patient type: ${patient}. Include: 1) Assessment steps, 2) Exact hand placement with description, 3) Compression depth & rate, 4) Rescue breathing technique, 5) AED usage steps, 6) Common mistakes to avoid, 7) When to stop CPR. Use clear numbered steps and visual descriptions.`
        }
      });
      if (error) throw error;
      setResult(data?.message || "No result");
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I C P R Coach - How it works"} steps={[{ title: 'Open', desc: 'Access the A I C P R Coach section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I C P R Coach.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="w-5 h-5 text-red-500" />AI CPR Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={patient} onValueChange={setPatient}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Adult (12+ years)</SelectItem>
              <SelectItem value="child">Child (1-12 years)</SelectItem>
              <SelectItem value="infant">Infant (0-1 year)</SelectItem>
              <SelectItem value="drowning">Drowning victim</SelectItem>
              <SelectItem value="pregnant">Pregnant woman</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Get CPR Guide (3 Credits)"}
          </Button>
          {result && <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
