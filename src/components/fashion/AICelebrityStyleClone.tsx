import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Star, Crown, Sparkles, Euro, ShoppingBag } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CREDIT_COST = 15;

interface CloneItem {
  original_item: string;
  brand: string;
  estimated_price: string;
  budget_alternative: string;
  budget_brand: string;
  budget_price: string;
  match_accuracy: number;
}

interface CloneResult {
  celebrity: string;
  look_description: string;
  style_era: string;
  difficulty_to_recreate: string;
  items: CloneItem[];
  total_original_cost: string;
  total_budget_cost: string;
  savings_percentage: number;
  styling_notes: string[];
  where_to_shop: string[];
}

export default function AICelebrityStyleClone() {
  const { credits, spendCredit } = useAICredits();
  const [celebrity, setCelebrity] = useState("");
  const [budget, setBudget] = useState("medium");
  const [result, setResult] = useState<CloneResult | null>(null);

  const clone = useMutation({
    mutationFn: async () => {
      if ((credits?.credits_remaining || 0) < CREDIT_COST) throw new Error("Not enough credits");
      const success = await spendCredit("custom_generation", "Celebrity Style Clone");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "celebrity-clone", celebrity, budget_level: budget },
      });
      if (error) throw error;
      return data as CloneResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Celebrity style breakdown ready!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <FloatingHowItWorks title="How AICelebrity Style Clone works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Celebrity Style Clone</h3>
            <p className="text-sm text-muted-foreground">Recreate iconic looks with budget alternatives • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Celebrity Name</Label>
            <Input placeholder="e.g. Zendaya, Harry Styles, Rihanna" value={celebrity} onChange={e => setCelebrity(e.target.value)} />
          </div>
          <div>
            <Label>Your Budget Level</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Budget Friendly (Under €50/item)</SelectItem>
                <SelectItem value="medium">Mid-Range (€50-150/item)</SelectItem>
                <SelectItem value="high">Premium (€150-500/item)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => clone.mutate()} disabled={clone.isPending || !celebrity} className="w-full gap-2">
          {clone.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
          Clone This Style ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-primary/20">
              <h3 className="font-bold text-xl mb-1">⭐ {result.celebrity}'s Look</h3>
              <p className="text-sm text-muted-foreground mb-2">{result.look_description}</p>
              <div className="flex gap-3 text-xs">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{result.style_era}</span>
                <span className="bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full">Difficulty: {result.difficulty_to_recreate}</span>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 bg-card/80 text-center border-red-500/20">
                <p className="text-[10px] text-muted-foreground">Original Cost</p>
                <p className="font-bold text-lg text-red-400">{result.total_original_cost}</p>
              </Card>
              <Card className="p-3 bg-card/80 text-center border-green-500/20">
                <p className="text-[10px] text-muted-foreground">Your Cost</p>
                <p className="font-bold text-lg text-green-400">{result.total_budget_cost}</p>
              </Card>
              <Card className="p-3 bg-card/80 text-center border-primary/20">
                <p className="text-[10px] text-muted-foreground">You Save</p>
                <p className="font-bold text-lg text-primary">{result.savings_percentage}%</p>
              </Card>
            </div>

            <div className="space-y-3">
              {result.items.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Original</p>
                        <p className="font-bold text-sm">{item.original_item}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} • {item.estimated_price}</p>
                      </div>
                      <div className="border-t sm:border-t-0 sm:border-l border-border/30 sm:pl-3 pt-2 sm:pt-0">
                        <p className="text-[10px] text-green-500 uppercase">Your Alternative</p>
                        <p className="font-bold text-sm">{item.budget_alternative}</p>
                        <p className="text-xs text-muted-foreground">{item.budget_brand} • {item.budget_price}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${item.match_accuracy}%` }} />
                      </div>
                      <span className="text-[10px] font-medium">{item.match_accuracy}% match</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" /> Where to Shop
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.where_to_shop.map((s, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
    );
}
