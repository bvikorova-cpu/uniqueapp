import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Loader2, ArrowLeft, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AIAllergyScanner({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [ingredients, setIngredients] = useState("");
  const [allergies, setAllergies] = useState("peanuts, gluten, lactose");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const credited = await spendCredit('custom_generation', 'Allergy Scanner');
      if (!credited) throw new Error('Not enough credits (5 required)');
      const { data, error } = await supabase.functions.invoke('nutrition-allergy-scanner', {
        body: { ingredients, known_allergies: allergies.split(',').map(a => a.trim()) }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.analysis); toast.success("Allergy scan complete!"); },
    onError: (e: any) => toast.error(e.message || "Error scanning"),
  });

  return (
    <>
      <FloatingHowItWorks title="AIAllergyScanner — How it works" steps={[{title:"Open this tool",desc:"Access AIAllergyScanner within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
              AI Allergy Scanner
            </CardTitle>
            <CardDescription>Paste ingredients or describe a dish to detect allergens (5 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ingredients / Dish Description</Label>
              <Textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="E.g. pasta with cream sauce, parmesan, breadcrumbs..." rows={4} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Your Known Allergies (comma-separated)</Label>
              <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="peanuts, gluten, shellfish" className="bg-background/50" />
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !ingredients || !credits || credits.credits_remaining < 5} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Scanning...</> : <><Sparkles className="h-5 w-5" /> Scan for Allergens (5 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Scan Results</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
                <div className={`p-4 rounded-xl border text-center ${result.is_safe ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20'}`}>
                  {result.is_safe ? <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" /> : <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />}
                  <p className="text-xl font-black">{result.is_safe ? "SAFE TO EAT" : "ALLERGENS DETECTED"}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.risk_level || "Check details below"}</p>
                </div>

                {result.detected_allergens && Array.isArray(result.detected_allergens) && result.detected_allergens.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">⚠️ Detected Allergens</h4>
                    {result.detected_allergens.map((a: any, i: number) => (
                      <div key={i} className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <p className="font-bold text-sm text-red-500">{a.allergen || a}</p>
                        <p className="text-xs text-muted-foreground">{a.source || "Found in ingredients"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.safe_alternatives && Array.isArray(result.safe_alternatives) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">✅ Safe Alternatives</h4>
                    {result.safe_alternatives.map((alt: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">💡 {alt}</p>
                    ))}
                  </div>
                )}

                {result.cross_contamination_risks && Array.isArray(result.cross_contamination_risks) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🔄 Cross-Contamination Risks</h4>
                    {result.cross_contamination_risks.map((risk: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">⚠️ {risk}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your allergy scan results will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>);
}
