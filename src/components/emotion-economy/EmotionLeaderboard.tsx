import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, TrendingUp, Zap, Wallet, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Tab = "traders" | "miners" | "wallets";

interface Props { onBack: () => void; }

export function EmotionLeaderboard({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("traders");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === "traders") {
        result = await supabase
          .from("emotion_wallets")
          .select("user_id, total_traded")
          .order("total_traded", { ascending: false })
          .limit(20);
      } else if (activeTab === "miners") {
        result = await supabase
          .from("emotion_wallets")
          .select("user_id, total_mined")
          .order("total_mined", { ascending: false })
          .limit(20);
      } else {
        result = await supabase
          .from("emotion_wallets")
          .select("user_id, joy_balance, love_balance, motivation_balance, excitement_balance, peace_balance")
          .limit(20);
      }
      setData(result.data || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (i === 1) return <Medal className="h-5 w-5 text-gray-300" />;
    if (i === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>;
  };

  const getValue = (item: any) => {
    if (activeTab === "traders") return item.total_traded || 0;
    if (activeTab === "miners") return item.total_mined || 0;
    return (item.joy_balance || 0) + (item.love_balance || 0) + (item.motivation_balance || 0) + (item.excitement_balance || 0) + (item.peace_balance || 0);
  };

  const tabs = [
    { key: "traders" as Tab, label: "Top Traders", icon: TrendingUp },
    { key: "miners" as Tab, label: "Top Miners", icon: Zap },
    { key: "wallets" as Tab, label: "Richest Wallets", icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Leaderboard"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(t.key)}
                className="gap-1.5"
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Button>
            ))}
          </div>

          {/* Leaderboard list */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data yet. Be the first on the leaderboard!
            </div>
          ) : (
            <div className="space-y-2">
              {data
                .sort((a, b) => getValue(b) - getValue(a))
                .map((item, i) => (
                  <motion.div
                    key={item.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      flex items-center justify-between p-3 rounded-xl border transition-all
                      ${i < 3
                        ? "border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent"
                        : "border-white/5 bg-white/5"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(i)}
                      <div>
                        <p className="text-sm font-medium">@user{item.user_id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {getValue(item).toLocaleString()}
                    </Badge>
                  </motion.div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
