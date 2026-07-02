import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Scan, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIInjuryAssessor({ onBack }: Props) {
  const [description, setDescription] = useState("");
  const [bodyPart, setBodyPart] = useState("limb");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const assess = async () => {
    if (!description.trim()) { toast.error("Describe the injury"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are a first aid injury assessment expert. Assess this injury: "${description}" on body part: ${bodyPart}. Provide: 1) Severity assessment (Minor/Moderate/Severe), 2) Immediate first aid steps, 3) Bandaging/immobilization technique, 4) Pain management, 5) Signs requiring emergency care, 6) Expected healing timeline. DISCLAIMER: This is not medical advice.`
        }
      });
      if (error) throw error;
      setResult(data?.message || "No result");
    } catch { toast.error("Assessment failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Injury Assessor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Injury Assessor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Injury Assessor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scan className="w-5 h-5 text-red-500" />AI Injury Assessor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
              For informational purposes only. Seek professional medical help for serious injuries.
            </AlertDescription>
          </Alert>
          <Select value={bodyPart} onValueChange={setBodyPart}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="head">Head / Face</SelectItem>
              <SelectItem value="neck">Neck / Spine</SelectItem>
              <SelectItem value="chest">Chest / Torso</SelectItem>
              <SelectItem value="abdomen">Abdomen</SelectItem>
              <SelectItem value="limb">Arm / Leg</SelectItem>
              <SelectItem value="hand">Hand / Fingers</SelectItem>
              <SelectItem value="foot">Foot / Toes</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Describe the injury in detail (what happened, symptoms, swelling, etc.)..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          <Button onClick={assess} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Assessing...</> : "Assess Injury (3 Credits)"}
          </Button>
          {result && <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
