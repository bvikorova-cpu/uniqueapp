import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Loader2, CreditCard, Eye, Share2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export default function RewardsShowcase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState("");
  const [topBadges, setTopBadges] = useState("");
  const [level, setLevel] = useState("");
  const [style, setStyle] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "achievement_showcase", badge_count: badgeCount, top_badges: topBadges, level, showcase_style: style },
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
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Achievement Showcase</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 4 credits per generation</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Eye, label: "Profile Card", desc: "Public display" },
            { icon: Share2, label: "Share Card", desc: "Social media" },
            { icon: Crown, label: "Hall of Fame", desc: "Top achievers" },
          ].map(f => (
            <div key={f.label} className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-center">
              <f.icon className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] font-bold">{f.label}</p>
              <p className="text-[9px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Input placeholder="Total badges earned" value={badgeCount} onChange={e => setBadgeCount(e.target.value)} />
          <Textarea placeholder="Your top/favorite badges (names)" value={topBadges} onChange={e => setTopBadges(e.target.value)} rows={2} />
          <Input placeholder="Current level" value={level} onChange={e => setLevel(e.target.value)} />
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger><SelectValue placeholder="Showcase style" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minimalist">Minimalist & Clean</SelectItem>
              <SelectItem value="golden-luxury">Golden Luxury</SelectItem>
              <SelectItem value="gamer">Gamer HUD</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Showcase — 4 Credits"}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
          <h4 className="font-bold mb-3 text-amber-500">🏅 Your Achievement Showcase</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
