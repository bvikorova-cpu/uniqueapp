import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function WishlistAlertsView({ onBack }: Props) {
  const [wishlistStores, setWishlistStores] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minDiscount, setMinDiscount] = useState("20");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!wishlistStores.trim()) { toast.error("Enter your wishlist stores"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "wishlist-alerts", wishlistStores, maxBudget, minDiscount, preferences },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Wishlist strategy ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Wishlist & Price Drop Alerts</h2>
            <p className="text-muted-foreground text-sm">Smart tracking & deal alert strategies · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-pink-500/10">
          <CardHeader><CardTitle>Wishlist Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Stores to Watch *</label>
              <Textarea placeholder="List stores you want to track. E.g.:&#10;Nike&#10;Amazon&#10;Sephora&#10;Apple" value={wishlistStores} onChange={e => setWishlistStores(e.target.value)} rows={4} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Max Budget per Coupon (€)</label>
              <Input type="number" placeholder="e.g., 50" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Minimum Discount (%)</label>
              <Input type="number" placeholder="20" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Shopping Preferences</label>
              <Textarea placeholder="What are you looking to buy? Any specific products or categories?" value={preferences} onChange={e => setPreferences(e.target.value)} rows={2} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Heart className="w-4 h-4 mr-2" />Get Alert Strategy (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-pink-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Wishlist Intelligence" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter your wishlist to get personalized deal alerts strategy</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
