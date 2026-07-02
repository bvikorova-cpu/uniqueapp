import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Smile, Frown, Meh, Heart, Flame, Snowflake, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AIMoodDetectionProps {
  onBack: () => void;
  userId: string;
}

const MOOD_KEYWORDS: Record<string, { keywords: string[]; emoji: string; color: string }> = {
  happy: { keywords: ["haha", "lol", "😂", "😄", "great", "awesome", "love", "amazing", "nice", "cool", "yay", "❤️", "🎉", "perfect", "fantastic"], emoji: "😊", color: "from-amber-500 to-yellow-500" },
  excited: { keywords: ["omg", "wow", "🔥", "incredible", "insane", "crazy", "lit", "🚀", "lets go", "hyped", "excited", "!!"], emoji: "🤩", color: "from-orange-500 to-red-500" },
  sad: { keywords: ["sad", "😢", "😭", "miss", "sorry", "unfortunately", "bad", "terrible", "awful", "hate", "worst", "crying"], emoji: "😢", color: "from-blue-500 to-indigo-500" },
  angry: { keywords: ["angry", "😡", "furious", "annoyed", "mad", "wtf", "stupid", "ridiculous", "unacceptable", "frustrated"], emoji: "😤", color: "from-red-500 to-rose-600" },
  neutral: { keywords: ["ok", "okay", "sure", "yeah", "alright", "fine", "hmm", "idk", "maybe"], emoji: "😐", color: "from-gray-400 to-gray-500" },
  loving: { keywords: ["love", "❤️", "😍", "miss you", "thinking of you", "care", "beautiful", "darling", "sweetie", "babe", "💕", "🥰"], emoji: "🥰", color: "from-pink-500 to-rose-500" },
};

const analyzeMood = (text: string): string => {
  const lower = text.toLowerCase();
  let maxScore = 0;
  let detected = "neutral";

  for (const [mood, data] of Object.entries(MOOD_KEYWORDS)) {
    const score = data.keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > maxScore) { maxScore = score; detected = mood; }
  }
  return detected;
};

export const AIMoodDetection = ({ onBack, userId }: AIMoodDetectionProps) => {
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<{
    overall: string;
    distribution: Record<string, number>;
    recentMoods: { mood: string; message: string; time: string }[];
    moodTrend: string[];
    conversationMoods: { name: string; mood: string }[];
  }>({
    overall: "neutral",
    distribution: {},
    recentMoods: [],
    moodTrend: [],
    conversationMoods: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    analyzeMessages();
  }, [userId]);

  const analyzeMessages = async () => {
    setLoading(true);

    const { data: messages } = await supabase
      .from("messages")
      .select("content, created_at, conversation_id")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(300);

    if (!messages || messages.length === 0) {
      setLoading(false);
      return;
    }

    const dist: Record<string, number> = {};
    const recent: { mood: string; message: string; time: string }[] = [];
    const dayMoods: Map<string, string[]> = new Map();
    const convMoodMap: Map<string, string[]> = new Map();

    for (const msg of messages) {
      const mood = analyzeMood(msg.content);
      dist[mood] = (dist[mood] || 0) + 1;

      if (recent.length < 10) {
        recent.push({
          mood,
          message: msg.content.substring(0, 60) + (msg.content.length > 60 ? "..." : ""),
          time: new Date(msg.created_at).toLocaleString(),
        });
      }

      const day = new Date(msg.created_at).toLocaleDateString();
      const existing = dayMoods.get(day) || [];
      existing.push(mood);
      dayMoods.set(day, existing);

      const convExisting = convMoodMap.get(msg.conversation_id) || [];
      convExisting.push(mood);
      convMoodMap.set(msg.conversation_id, convExisting);
    }

    // Overall mood (most frequent)
    const overall = Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    // Last 7 days trend
    const sortedDays = [...dayMoods.entries()].sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).slice(0, 7).reverse();
    const moodTrend = sortedDays.map(([, moods]) => {
      const counts: Record<string, number> = {};
      moods.forEach(m => { counts[m] = (counts[m] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
    });

    // Per-conversation mood
    const conversationMoods: { name: string; mood: string }[] = [];
    for (const [convId, moods] of convMoodMap.entries()) {
      const counts: Record<string, number> = {};
      moods.forEach(m => { counts[m] = (counts[m] || 0) + 1; });
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convId)
        .neq("user_id", userId)
        .limit(1);

      if (parts?.[0]) {
        const { data: profile } = await (supabase as any).from("profiles_public").select("full_name").eq("id", parts[0].user_id).single();
        conversationMoods.push({ name: profile?.full_name || "Unknown", mood: dominant });
      }
    }

    setMoodData({ overall, distribution: dist, recentMoods: recent, moodTrend, conversationMoods: conversationMoods.slice(0, 6) });
    setLoading(false);
  };

  const totalMessages = Object.values(moodData.distribution).reduce((a, b) => a + b, 0) || 1;
  const moodInfo = MOOD_KEYWORDS[moodData.overall] || MOOD_KEYWORDS.neutral;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
      <FloatingHowItWorks
        title={"A I Mood Detection"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-bold">Analyzing your message moods...</p>
          <p className="text-xs text-muted-foreground">Scanning up to 300 recent messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Mood Detection</h2>
          <p className="text-sm text-muted-foreground">Emotional tone analysis of your messages</p>
        </div>
      </div>

      {/* Overall Mood */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className={`border-border/40 bg-gradient-to-br ${moodInfo.color} text-white overflow-hidden`}>
          <CardContent className="p-6 text-center">
            <p className="text-6xl mb-3">{moodInfo.emoji}</p>
            <h3 className="text-2xl font-black capitalize">{moodData.overall}</h3>
            <p className="text-white/80 text-sm">Your dominant messaging mood</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black">
              <TrendingUp className="h-5 w-5 text-primary" /> Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(moodData.distribution).sort((a, b) => b[1] - a[1]).map(([mood, count], i) => {
              const info = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.neutral;
              const pct = Math.round((count / totalMessages) * 100);
              return (
                <motion.div key={mood} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold capitalize">{mood}</span>
                        <span className="text-xs text-muted-foreground">{pct}% ({count})</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                          className={`h-full bg-gradient-to-r ${info.color} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* 7-Day Mood Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black">
              <Sparkles className="h-5 w-5 text-primary" /> 7-Day Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {moodData.moodTrend.map((mood, i) => {
                const info = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.neutral;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl">{info.emoji}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Day {i + 1}</p>
                  </motion.div>
                );
              })}
              {moodData.moodTrend.length === 0 && (
                <p className="text-sm text-muted-foreground text-center w-full py-4">Not enough data for trend analysis</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-Contact Mood */}
      {moodData.conversationMoods.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black">
                <Heart className="h-5 w-5 text-primary" /> Mood Per Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {moodData.conversationMoods.map((cm, i) => {
                  const info = MOOD_KEYWORDS[cm.mood] || MOOD_KEYWORDS.neutral;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                      className="p-3 rounded-xl bg-muted/30 text-center"
                    >
                      <p className="text-2xl mb-1">{info.emoji}</p>
                      <p className="text-xs font-bold truncate">{cm.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{cm.mood}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
