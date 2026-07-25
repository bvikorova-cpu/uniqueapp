import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRightLeft, Gift, Loader2, Send, Users, History, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const MysteryBoxTrading = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"gift" | "items" | "history">("gift");
  const [recipient, setRecipient] = useState("");
  const [giftCredits, setGiftCredits] = useState(50);
  const [giftMessage, setGiftMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [giftHistory, setGiftHistory] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [itemsRes, historyRes] = await Promise.all([
      supabase.from('mystery_box_rewards')
        .select('*, mystery_box_items(item_name, item_type, item_data, rarity, duration_days)')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })
        .limit(50),
      supabase.from('ai_usage_history').select('*').eq('user_id', user.id).in('usage_type', ['gift_credits', 'gift_received']).order('created_at', { ascending: false }).limit(20),
    ]);
    setMyItems(itemsRes.data || []);
    setGiftHistory(historyRes.data || []);
  };

  const sendGift = async () => {
    const target = recipient.trim();
    if (!target) { toast.error("Enter a Unique name or email"); return; }
    if (giftCredits < 10) { toast.error("Minimum gift is 10 credits"); return; }
    if (credits.credits_remaining < giftCredits) {
      toast.error("Insufficient credits"); return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('gift_ai_credits_by_identifier', {
        p_recipient: target,
        p_amount: giftCredits,
        p_message: giftMessage || null,
      });
      if (error) throw error;

      await Promise.all([refresh(), loadData()]);
      const label = (data as any)?.recipient || target;
      toast.success(`🎁 ${giftCredits} credits sent to ${label}!`);
      setRecipient("");
      setGiftCredits(50);
      setGiftMessage("");
      setActiveTab("history");
    } catch (e: any) {
      toast.error(e.message || "Failed to send gift");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "gift" as const, icon: Gift, label: "Gift Credits" },
    { id: "items" as const, icon: ArrowRightLeft, label: "My Items" },
    { id: "history" as const, icon: History, label: "History" },
  ];

  const rewardItem = (item: any) => {
    const joined = item?.mystery_box_items;
    return Array.isArray(joined) ? joined[0] : joined;
  };

  return (
    <>
      <FloatingHowItWorks title={"Mystery Box Trading - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Box Trading section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Box Trading.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/90 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <ArrowRightLeft className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Trading & Gifting</h2>
            <p className="text-muted-foreground text-xs">Send credits or trade items with friends</p>
          </div>
        </motion.div>

        {/* Tabs — scroll horizontally on mobile so History is always reachable */}
        <div className="flex gap-2 mb-6 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none snap-x">
          {tabs.map(t => (
            <Button
              key={t.id}
              variant={activeTab === t.id ? "default" : "outline"}
              onClick={() => setActiveTab(t.id)}
              size="sm"
              className={`shrink-0 snap-start ${activeTab === t.id ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold" : "border-yellow-500/20"}`}
            >
              <t.icon className="h-3.5 w-3.5 mr-1.5" /> {t.label}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "gift" && (
            <motion.div key="gift" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <Card className="p-4 bg-green-500/5 border-green-500/20 flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-400">Secure Gifting</p>
                  <p className="text-xs text-muted-foreground">Credits are transferred instantly and securely. Minimum gift: 10 credits.</p>
                </div>
              </Card>

              <div>
                <Label className="text-yellow-400/80 font-semibold text-sm">Recipient — Unique name or email</Label>
                <Input
                  placeholder="@username or friend@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 border-yellow-500/20 focus:border-yellow-500/50 bg-background/50"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Enter their Unique @username (recommended), full name, or email.</p>
              </div>
              <div>
                <Label className="text-yellow-400/80 font-semibold text-sm">Credits to Gift</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {[10, 25, 50, 100, 250, 500].map(amt => (
                    <Button
                      key={amt}
                      size="sm"
                      variant="outline"
                      onClick={() => setGiftCredits(amt)}
                      className={`text-xs border-yellow-500/20 ${giftCredits === amt ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-400" : ""}`}
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
              <div>
                <Label className="text-yellow-400/80 font-semibold text-sm">Message (optional)</Label>
                <Input
                  placeholder="Enjoy your mystery boxes! 🎁"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="mt-1 border-yellow-500/20 bg-background/50"
                />
              </div>
              <Button
                onClick={sendGift}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-base shadow-lg shadow-yellow-500/25 active:scale-[0.97] transition-transform"
              >
                {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</> : <><Send className="h-5 w-5 mr-2" /> Send Gift — {giftCredits} Credits</>}
              </Button>
            </motion.div>
          )}

          {activeTab === "items" && (
            <motion.div key="items" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {myItems.length === 0 ? (
                <Card className="p-12 text-center border-yellow-500/10">
                  <Users className="h-12 w-12 mx-auto text-yellow-500/30 mb-3" />
                  <p className="text-muted-foreground font-medium">No mystery box items yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Open mystery boxes to collect items!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {myItems.map((item, i) => {
                    const details = rewardItem(item);
                    const rarity = (details?.rarity || 'common').toString();
                    const type = details?.item_type ? details.item_type.replace(/_/g, ' ') : 'item';
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ scale: 1.04, y: -4 }}
                      >
                        <Card className="p-3 border-yellow-500/10 hover:border-yellow-500/30 transition-all bg-card/50">
                          <p className="font-bold text-sm truncate">{details?.item_name || 'Mystery reward'}</p>
                          <p className="text-xs text-yellow-400 capitalize">{rarity} {type}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.received_at).toLocaleDateString()}</p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {giftHistory.length === 0 ? (
                <Card className="p-12 text-center border-yellow-500/10">
                  <History className="h-12 w-12 mx-auto text-yellow-500/30 mb-3" />
                  <p className="text-muted-foreground">No gift history yet.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {giftHistory.map((h, i) => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-3 border-yellow-500/10 flex items-center gap-3">
                        <Gift className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{h.description}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold text-yellow-400">-{h.credits_used}</span>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
    </>
  );
};
