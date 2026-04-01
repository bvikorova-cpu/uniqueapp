import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRightLeft, Gift, Loader2, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const MysteryBoxTrading = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"gift" | "trade">("gift");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftCredits, setGiftCredits] = useState(50);
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState<any[]>([]);

  useEffect(() => {
    loadMyItems();
  }, []);

  const loadMyItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_collectibles').select('*, collectibles(*)').eq('user_id', user.id).limit(20);
    setMyItems(data || []);
  };

  const sendGift = async () => {
    if (!recipientEmail) { toast.error("Enter recipient's email"); return; }
    if (giftCredits < 10) { toast.error("Minimum gift is 10 credits"); return; }
    if (credits.credits_remaining < giftCredits) {
      toast.error("Insufficient credits"); return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find recipient by checking profiles
      const { data: profiles } = await supabase.from('profiles').select('id').eq('email', recipientEmail).maybeSingle();
      
      if (!profiles) {
        toast.error("User not found. Check the email address.");
        setLoading(false);
        return;
      }

      // Deduct from sender
      await supabase.from('ai_credits').update({
        credits_remaining: credits.credits_remaining - giftCredits
      }).eq('user_id', user.id);

      // Add to recipient
      const { data: recipientCredits } = await supabase.from('ai_credits').select('credits_remaining').eq('user_id', profiles.id).single();
      if (recipientCredits) {
        await supabase.from('ai_credits').update({
          credits_remaining: recipientCredits.credits_remaining + giftCredits
        }).eq('user_id', profiles.id);
      }

      // Log
      await supabase.from('ai_usage_history').insert({
        user_id: user.id,
        usage_type: 'gift_credits',
        credits_used: giftCredits,
        description: `Gifted ${giftCredits} credits to ${recipientEmail}`
      });

      await refresh();
      toast.success(`🎁 ${giftCredits} credits sent to ${recipientEmail}!`);
      setRecipientEmail("");
      setGiftCredits(50);
    } catch (e: any) {
      toast.error(e.message || "Failed to send gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <ArrowRightLeft className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Trading & Gifting</h2>
            <p className="text-muted-foreground text-sm">Send credits or trade items with friends</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "gift" ? "default" : "outline"}
            onClick={() => setActiveTab("gift")}
            className={activeTab === "gift" ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold" : "border-yellow-500/20"}
          >
            <Gift className="h-4 w-4 mr-2" /> Gift Credits
          </Button>
          <Button
            variant={activeTab === "trade" ? "default" : "outline"}
            onClick={() => setActiveTab("trade")}
            className={activeTab === "trade" ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold" : "border-yellow-500/20"}
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" /> My Items
          </Button>
        </div>

        {activeTab === "gift" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <Label className="text-yellow-400/80 font-semibold">Recipient Email</Label>
              <Input
                placeholder="friend@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1 border-yellow-500/20 focus:border-yellow-500/50 bg-background/50"
              />
            </div>
            <div>
              <Label className="text-yellow-400/80 font-semibold">Credits to Gift</Label>
              <div className="flex gap-2 mt-1">
                {[10, 25, 50, 100, 250, 500].map(amt => (
                  <Button
                    key={amt}
                    size="sm"
                    variant="outline"
                    onClick={() => setGiftCredits(amt)}
                    className={`text-xs border-yellow-500/20 ${giftCredits === amt ? "bg-yellow-500/10 border-yellow-500/40" : ""}`}
                  >
                    {amt}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                min={10}
                value={giftCredits}
                onChange={(e) => setGiftCredits(Number(e.target.value))}
                className="mt-2 border-yellow-500/20 bg-background/50"
              />
            </div>
            <Button
              onClick={sendGift}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-base shadow-lg shadow-yellow-500/20"
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</> : <><Send className="h-5 w-5 mr-2" /> Send Gift — {giftCredits} Credits</>}
            </Button>
          </motion.div>
        )}

        {activeTab === "trade" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {myItems.length === 0 ? (
              <Card className="p-12 text-center border-yellow-500/10">
                <Users className="h-12 w-12 mx-auto text-yellow-500/30 mb-3" />
                <p className="text-muted-foreground">No collectible items yet. Open mystery boxes to collect items!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {myItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-3 border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                      <p className="font-bold text-sm truncate">{item.collectibles?.name || 'Unknown Item'}</p>
                      <p className="text-xs text-muted-foreground">{item.collectibles?.rarity || 'Common'}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Acquired: {new Date(item.created_at).toLocaleDateString()}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </Card>
    </div>
  );
};
