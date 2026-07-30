import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Star, Smile, TrendingUp, Thermometer, Loader2, PawPrint } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Translation = {
  id: string;
  emotion: string | null;
  confidence: number | null;
  is_favorite: boolean | null;
  created_at: string;
};

const POSITIVE = ["happy", "playful", "excited", "affectionate", "content", "curious", "relaxed"];
const NEGATIVE = ["anxious", "stressed", "sad", "angry", "fearful", "aggressive", "pain", "sick"];

const classify = (emotion: string | null) => {
  const e = (emotion || "").toLowerCase();
  if (POSITIVE.some(p => e.includes(p))) return "positive";
  if (NEGATIVE.some(n => e.includes(n))) return "negative";
  return "neutral";
};

export default function PetHealthDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [petCount, setPetCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const since = new Date(Date.now() - 29 * 86400000).toISOString();

    const [tRes, pRes, sRes] = await Promise.all([
      supabase.from("pet_translations")
        .select("id, emotion, confidence, is_favorite, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true }),
      supabase.from("pet_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("pet_symptoms_log").select("urgency").eq("user_id", user.id).gte("created_at", since),
    ]);

    setTranslations((tRes.data as Translation[]) || []);
    setPetCount(pRes.count || 0);
    setUrgentCount(
      ((sRes.data as { urgency: string | null }[]) || []).filter(
        r => (r.urgency || "").toLowerCase().includes("high") || (r.urgency || "").toLowerCase().includes("urgent")
      ).length
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const weekly = useMemo(() => {
    const days: { day: string; positive: number; neutral: number; negative: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        positive: 0, neutral: 0, negative: 0,
      });
    }
    translations.forEach(t => {
      const diff = Math.floor((Date.now() - new Date(t.created_at).getTime()) / 86400000);
      if (diff < 0 || diff > 6) return;
      const idx = 6 - diff;
      const k = classify(t.emotion) as "positive" | "neutral" | "negative";
      days[idx][k] += 1;
    });
    return days;
  }, [translations]);

  const radar = useMemo(() => {
    const counts = new Map<string, number>();
    translations.forEach(t => {
      const e = (t.emotion || "Unknown").trim();
      const label = e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const total = translations.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([subject, n]) => ({ subject, A: Math.round((n / total) * 100) }));
  }, [translations]);

  const stats = useMemo(() => {
    const total = translations.length;
    const positive = translations.filter(t => classify(t.emotion) === "positive").length;
    const favorites = translations.filter(t => t.is_favorite).length;
    const avgConfidence = total
      ? Math.round(translations.reduce((s, t) => s + (Number(t.confidence) || 0), 0) / total)
      : 0;
    return [
      { label: "Positive moods", value: total ? `${Math.round((positive / total) * 100)}%` : "—", icon: Heart, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/10" },
      { label: "Translations (30d)", value: String(total), icon: Activity, color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/10" },
      { label: "Pets tracked", value: String(petCount), icon: PawPrint, color: "text-indigo-400", bg: "from-indigo-500/20 to-violet-500/10" },
      { label: "Saved favourites", value: String(favorites), icon: Star, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/10" },
      { label: "Avg. confidence", value: avgConfidence ? `${avgConfidence}%` : "—", icon: Smile, color: "text-purple-400", bg: "from-purple-500/20 to-fuchsia-500/10" },
      { label: "Urgent alerts (30d)", value: String(urgentCount), icon: Thermometer, color: "text-red-400", bg: "from-red-500/20 to-orange-500/10" },
    ];
  }, [translations, petCount, urgentCount]);

  const hasData = translations.length > 0;

  return (
    <>
      <FloatingHowItWorks title="How Pet Health Dashboard works" steps={[
          { title: 'Use the translator', desc: 'Every translation, photo and video analysis is stored in your history.' },
          { title: 'Your data only', desc: 'This dashboard shows statistics calculated from your own pets and results.' },
          { title: 'Track trends', desc: 'See mood distribution and the last 7 days of detected emotions.' },
          { title: 'Act on alerts', desc: 'Urgent symptom checks from the last 30 days are counted here.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-black">📊 Pet Health Dashboard</h2>
        <Badge variant="outline" className="text-[10px]">Live data · last 30 days</Badge>
      </div>

      {!user ? (
        <Card className="bg-card/80 border-purple-500/20">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Sign in to see your pet health statistics.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`bg-gradient-to-br ${stat.bg} border-border/30 text-center p-3 h-full`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-lg font-black">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {!hasData ? (
            <Card className="bg-card/80 border-purple-500/20">
              <CardContent className="p-8 text-center space-y-1">
                <p className="text-sm font-semibold">No data yet</p>
                <p className="text-xs text-muted-foreground">
                  Run your first translation or photo analysis — your real statistics will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card/80 border-purple-500/20">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" /> Last 7 days · detected moods
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="neutral" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1" />Positive</Badge>
                    <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block mr-1" />Neutral</Badge>
                    <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1" />Negative</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 border-purple-500/20">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-purple-400" /> Emotion profile (share of results)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radar}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Share %" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
    </>
    );
}
