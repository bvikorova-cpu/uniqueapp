import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Loader2, CreditCard, Heart, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export default function RewardsGiftXP() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [occasion, setOccasion] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!recipientName || !xpAmount) {
      toast({ title: "Required", description: "Enter recipient and XP amount", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "gift_xp", recipient_name: recipientName, xp_amount: xpAmount, occasion, personal_message: personalMessage },
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

  const giftOptions = [
    { amount: "50", label: "Small Gift", emoji: "🎁", desc: "A thoughtful gesture" },
    { amount: "100", label: "Nice Gift", emoji: "🎀", desc: "Show appreciation" },
    { amount: "250", label: "Big Gift", emoji: "💝", desc: "Make their day" },
    { amount: "500", label: "Premium Gift", emoji: "👑", desc: "Legendary generosity" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gift XP System</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 3 credits + AI gift card</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {giftOptions.map(opt => (
            <button
              key={opt.amount}
              onClick={() => setXpAmount(opt.amount)}
              className={`rounded-lg border p-2.5 text-center transition-all ${xpAmount === opt.amount ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/10" : "border-border/30 hover:border-pink-400/30"}`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <p className="text-xs font-bold mt-1">{opt.amount} XP</p>
              <p className="text-[10px] text-muted-foreground">{opt.label}</p>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Input placeholder="Recipient username or email" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
          <Input placeholder="Custom XP amount (or use presets above)" value={xpAmount} onChange={e => setXpAmount(e.target.value)} />
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger><SelectValue placeholder="Occasion (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">🎂 Birthday</SelectItem>
              <SelectItem value="achievement">🏆 Achievement</SelectItem>
              <SelectItem value="thank-you">🙏 Thank You</SelectItem>
              <SelectItem value="encouragement">💪 Encouragement</SelectItem>
              <SelectItem value="just-because">💕 Just Because</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Personal message (AI will create a beautiful gift card)" value={personalMessage} onChange={e => setPersonalMessage(e.target.value)} rows={2} />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Gift...</> : <><Send className="h-4 w-4 mr-2" /> Send XP Gift — 3 Credits</>}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-pink-400/20">
          <h4 className="font-bold mb-3 text-pink-500">🎁 Gift Card Created</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
