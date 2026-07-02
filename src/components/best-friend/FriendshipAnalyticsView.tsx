import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, Heart, Smile, BarChart3, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const FriendshipAnalyticsView = () => {
  const [messageCount, setMessageCount] = useState("50");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "friendship_analytics", messageCount: parseInt(messageCount) || 50 },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Analytics generated! (4 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Friendship Analytics View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <TrendingUp className="h-10 w-10 text-purple-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">AI Friendship Analytics</h2>
        <p className="text-muted-foreground text-sm">Deep insights into your conversation patterns & emotional trends</p>
        <Badge variant="secondary" className="mt-2">4 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Approximate messages exchanged</label>
              <Input value={messageCount} onChange={(e) => setMessageCount(e.target.value)} placeholder="50" type="number" />
            </div>
            <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Generate Analytics
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Health Score */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-5xl font-black text-purple-400">{result.friendship_health_score}</div>
                <p className="text-sm text-muted-foreground mt-1">Friendship Health Score</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Communication Style */}
          {result.communication_style && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Smile className="h-5 w-5 text-purple-400" /> Communication Style</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Badge className="bg-purple-500/20 text-purple-300">{result.communication_style.primary_style}</Badge>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {result.communication_style.strengths?.map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emotional Trends */}
          {result.emotional_trends && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" /> Emotional Trends</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.emotional_trends.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                      <span className="text-sm font-medium">{t.week}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${t.sentiment_score * 10}%` }} />
                        </div>
                        <Badge variant="outline" className="text-xs">{t.dominant_emotion}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growth Areas */}
          {result.growth_areas && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" /> Growth Areas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.growth_areas.map((g: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50">
                      <div className="font-medium text-sm">{g.emoji} {g.area}</div>
                      <p className="text-xs text-muted-foreground mt-1">{g.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fun Stats */}
          {result.fun_stats && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader><CardTitle className="text-lg">🎉 Fun Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-black">{result.fun_stats.total_laughs}</div>
                    <p className="text-xs text-muted-foreground">😂 Laughs</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-black">{result.fun_stats.deep_conversations}</div>
                    <p className="text-xs text-muted-foreground">💭 Deep Talks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50">
                    <div className="text-2xl font-black">{result.fun_stats.supportive_moments}</div>
                    <p className="text-xs text-muted-foreground">🤗 Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Analyze Again</Button>
        </div>
      )}
    </div>
  );
};
