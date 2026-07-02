import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category: string;
  hypothesis: string;
  observations: string;
  onCreditsChanged?: () => void;
}

interface SafetyResult {
  riskLevel: "safe" | "caution" | "unsafe";
  concerns: string[];
  requiredSupervision: string;
  requiredGear: string[];
  saferAlternatives: string[];
  ageAppropriate: boolean;
  notes: string;
}

export const SafetyCheckCard = ({ category, hypothesis, observations, onCreditsChanged }: Props) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);

  const run = async () => {
    if (!hypothesis.trim() || !observations.trim()) {
      toast.error("Fill in your hypothesis and plan first");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kids-science-helper", {
        body: { action: "safetyCheck", category, hypothesis, observations },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as SafetyResult);
      onCreditsChanged?.();
      toast.success("Safety check complete 🛡️");
    } catch (e: any) {
      toast.error(e?.message ?? "Safety check failed");
    } finally {
      setLoading(false);
    }
  };

  const icon = result?.riskLevel === "safe"
    ? <ShieldCheck className="h-5 w-5 text-emerald-500" />
    : result?.riskLevel === "caution"
    ? <ShieldAlert className="h-5 w-5 text-amber-500" />
    : <ShieldX className="h-5 w-5 text-red-500" />;

  const tone = result?.riskLevel === "safe"
    ? "bg-emerald-500/10 border-emerald-500/40"
    : result?.riskLevel === "caution"
    ? "bg-amber-500/10 border-amber-500/40"
    : "bg-red-500/10 border-red-500/40";

  return (
    <>
      <FloatingHowItWorks title={"Safety Check Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Check Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Check Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className={result ? tone : "border-primary/30"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {result ? icon : <ShieldCheck className="h-5 w-5 text-primary" />}
            AI Safety Check
          </span>
          <Badge variant="outline" className="text-xs">2 credits</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result && (
          <>
            <p className="text-sm text-muted-foreground">
              Let AI scan your experiment for safety hazards before you start.
            </p>
            <Button onClick={run} disabled={loading} className="w-full" variant="secondary">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning…</> : "Run safety check"}
            </Button>
          </>
        )}
        {result && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge>{result.riskLevel.toUpperCase()}</Badge>
              {!result.ageAppropriate && <Badge variant="destructive">Not age-appropriate</Badge>}
            </div>
            {result.concerns?.length > 0 && (
              <div>
                <p className="font-semibold mb-1">⚠️ Concerns</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.concerns.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {result.requiredGear?.length > 0 && (
              <div>
                <p className="font-semibold mb-1">🧰 Required gear</p>
                <p className="text-muted-foreground">{result.requiredGear.join(", ")}</p>
              </div>
            )}
            {result.requiredSupervision && (
              <div>
                <p className="font-semibold mb-1">👨‍👩‍👧 Supervision</p>
                <p className="text-muted-foreground">{result.requiredSupervision}</p>
              </div>
            )}
            {result.saferAlternatives?.length > 0 && (
              <div>
                <p className="font-semibold mb-1">✅ Safer alternatives</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.saferAlternatives.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.notes && <p className="text-xs text-muted-foreground italic">{result.notes}</p>}
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>Re-run check</Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
