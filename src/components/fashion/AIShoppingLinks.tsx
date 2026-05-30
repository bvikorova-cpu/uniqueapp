import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ShoppingCart, ExternalLink, Sparkles, Euro, Tag, Heart } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";

const CREDIT_COST = 6;

interface ShoppingItem {
  item_name: string;
  brand: string;
  estimated_price: string;
  where_to_buy: string[];
  style_match_score: number;
  description: string;
  alternatives: { name: string; price: string; brand: string }[];
}

interface ShoppingResult {
  outfit_concept: string;
  total_estimated_budget: string;
  items: ShoppingItem[];
  styling_tip: string;
}

export default function AIShoppingLinks() {
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("200");
  const [style, setStyle] = useState("casual-chic");
  const [result, setResult] = useState<ShoppingResult | null>(null);
  const { credits, spendCredit } = useAICredits();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < CREDIT_COST; i++) {
        const ok = await spendCredit("custom_generation", "AI Shopping Links");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "shopping-links", description, budget: parseInt(budget), style },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.shoppingGuide);
      toast.success("Shopping guide generated!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate"),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Shopping Links</h2>
            <p className="text-sm text-muted-foreground">Get direct purchase recommendations for any outfit idea • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>What are you looking for?</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the outfit or item... e.g., 'Elegant evening look for a rooftop dinner'" rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Budget (€)</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">Up to €50</SelectItem>
                  <SelectItem value="100">Up to €100</SelectItem>
                  <SelectItem value="200">Up to €200</SelectItem>
                  <SelectItem value="500">Up to €500</SelectItem>
                  <SelectItem value="1000">Up to €1,000</SelectItem>
                  <SelectItem value="5000">Luxury (€5,000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style Preference</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual-chic">Casual Chic</SelectItem>
                  <SelectItem value="streetwear">Streetwear</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="bohemian">Bohemian</SelectItem>
                  <SelectItem value="sporty">Sporty</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !description.trim() || (credits?.credits_remaining || 0) < CREDIT_COST} className="w-full gap-2" size="lg">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Finding Items...</> : <><ShoppingCart className="h-4 w-4" /> Get Shopping Guide ({CREDIT_COST} Credits)</>}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-primary/30">
              <h3 className="text-xl font-black mb-2">{result.outfit_concept}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1"><Euro className="h-3 w-3" /> Budget: {result.total_estimated_budget}</span>
              </div>
              {result.styling_tip && <p className="text-sm text-muted-foreground mt-3 italic">💡 {result.styling_tip}</p>}
            </Card>

            {result.items?.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 bg-card/80 border-white/10 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{item.item_name}</h4>
                      <p className="text-sm text-muted-foreground">{item.brand} • {item.estimated_price}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-1">
                      <Heart className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold">{item.style_match_score}%</span>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{item.description}</p>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Where to Buy:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.where_to_buy.map((store, j) => (
                        <span key={j} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> {store}
                        </span>
                      ))}
                    </div>
                  </div>

                  {item.alternatives.length > 0 && (
                    <div className="border-t border-border/50 pt-3 mt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Budget Alternatives:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {item.alternatives.map((alt, j) => (
                          <div key={j} className="text-xs bg-background/50 rounded-lg p-2">
                            <p className="font-semibold">{alt.name}</p>
                            <p className="text-muted-foreground">{alt.brand} • {alt.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
