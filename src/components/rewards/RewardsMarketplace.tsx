import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, CreditCard, ArrowLeftRight, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const shopItems = [
  { id: "ai-credits-10", name: "10 AI Credits", cost: "500 XP", emoji: "🤖", desc: "Use across all AI tools", category: "credits" },
  { id: "streak-shield", name: "Streak Shield", cost: "200 XP", emoji: "🛡️", desc: "Protect streak for 1 day", category: "booster" },
  { id: "xp-doubler", name: "XP Doubler (24h)", cost: "750 XP", emoji: "⚡", desc: "2x XP for 24 hours", category: "booster" },
  { id: "mystery-box", name: "Mystery Badge Box", cost: "1000 XP", emoji: "📦", desc: "Random rare badge", category: "badge" },
  { id: "premium-avatar", name: "Premium Avatar Frame", cost: "1500 XP", emoji: "👑", desc: "Golden profile frame", category: "cosmetic" },
  { id: "vip-access", name: "VIP Chat Room (7d)", cost: "2000 XP", emoji: "💎", desc: "Exclusive community access", category: "access" },
];

export default function RewardsMarketplace() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentXP, setCurrentXP] = useState("");
  const [spendingGoal, setSpendingGoal] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "reward_marketplace", current_xp: currentXP, spending_goal: spendingGoal, selected_item: selectedItem },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Shop Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shopItems.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
              className={`p-3 cursor-pointer transition-all hover:shadow-lg ${selectedItem === item.id ? "border-amber-500 bg-amber-500/10 shadow-amber-500/10 ring-1 ring-amber-500" : "bg-card/80 border-border/30 hover:border-amber-400/30"}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <h4 className="font-bold text-xs mt-1.5">{item.name}</h4>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              <p className="text-xs font-black text-amber-500 mt-1.5">{item.cost}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Shopping Advisor */}
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Shopping Advisor</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 4 credits — optimize your spending</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input placeholder="Your current XP balance" value={currentXP} onChange={e => setCurrentXP(e.target.value)} />
          <Select value={spendingGoal} onValueChange={setSpendingGoal}>
            <SelectTrigger><SelectValue placeholder="Spending priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="maximize-value">Maximize Value</SelectItem>
              <SelectItem value="boost-progression">Boost Progression</SelectItem>
              <SelectItem value="collect-cosmetics">Collect Cosmetics</SelectItem>
              <SelectItem value="ai-tools">Get More AI Credits</SelectItem>
              <SelectItem value="balanced">Balanced Strategy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : <><ArrowLeftRight className="h-4 w-4 mr-2" /> Get Shopping Advice — 4 Credits</>}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-emerald-400/20">
          <h4 className="font-bold mb-3 text-emerald-500">🛒 Shopping Recommendation</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
