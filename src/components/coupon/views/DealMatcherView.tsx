import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function DealMatcherView({ onBack }: Props) {
  const [favoriteStores, setFavoriteStores] = useState("");
  const [categories, setCategories] = useState("");
  const [budget, setBudget] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!favoriteStores.trim() && !categories.trim()) { toast.error("Enter stores or categories"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "deal-matcher", favoriteStores, categories, budget, minDiscount, frequency, lookingFor },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Deals found! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Deal Matcher</h2>
            <p className="text-muted-foreground text-sm">Find best deals for your shopping style · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/10">
          <CardHeader><CardTitle>Your Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Favorite Stores *</label><Input placeholder="e.g., Nike, Amazon, Zara..." value={favoriteStores} onChange={e => setFavoriteStores(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Shopping Categories</label><Input placeholder="e.g., Fashion, Electronics, Food..." value={categories} onChange={e => setCategories(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Monthly Budget (€)</label><Input type="number" placeholder="e.g., 100" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Minimum Discount (%)</label><Input type="number" placeholder="e.g., 20" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Shopping Frequency</label><Input placeholder="e.g., Weekly, Monthly..." value={frequency} onChange={e => setFrequency(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Looking For (specific)</label><Input placeholder="e.g., Running shoes, coffee, electronics..." value={lookingFor} onChange={e => setLookingFor(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Matching...</> : <><Target className="w-4 h-4 mr-2" />Find Deals (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-emerald-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Your Deal Matches" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter your preferences to find personalized deals</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
