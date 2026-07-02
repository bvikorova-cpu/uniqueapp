import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Calendar, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { format, subDays } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const WeeklyWellnessReport = ({ onBack }: Props) => {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Load existing reports
    const { data: reps } = await (supabase as any).from("psychology_wellness_reports")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    if (reps) setReports(reps);

    // Load this week's mood data for preview
    const weekAgo = subDays(new Date(), 7).toISOString();
    const { data: moods } = await (supabase as any).from("psychology_mood_entries")
      .select("*").eq("user_id", user.id).gte("created_at", weekAgo);

    const { data: sessions } = await (supabase as any).from("psychology_meditation_sessions")
      .select("*").eq("user_id", user.id).gte("created_at", weekAgo);

    setWeeklyData({
      moodEntries: moods?.length || 0,
      avgMood: moods?.length ? (moods.reduce((s: number, e: any) => s + e.mood_score, 0) / moods.length).toFixed(1) : "—",
      meditations: sessions?.length || 0,
      totalMedMin: sessions?.length ? Math.floor(sessions.reduce((s: number, e: any) => s + (e.duration_seconds || 0), 0) / 60) : 0,
      topTags: getTopTags(moods || []),
    });
    setLoading(false);
  };

  const getTopTags = (moods: any[]) => {
    const counts: Record<string, number> = {};
    moods.forEach(m => (m.tags || []).forEach((t: string) => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => tag);
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("psychology-ai");
      if (error) throw error;
      toast.success("Weekly report generated! 10 credits used.");
      setSelectedReport(data);
      loadData();
    } catch (e: any) {
      if (e.message?.includes("credits") || e.message?.includes("Insufficient")) {
        toast.error("Insufficient credits. Please purchase more.");
      } else {
        toast.error("Failed to generate report: " + (e.message || "Unknown error"));
      }
    } finally { setGenerating(false); }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Weekly Wellness Report - How it works"} steps={[{ title: 'Open', desc: 'Access the Weekly Wellness Report section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weekly Wellness Report.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Weekly Wellness Report
        </h2>
        <p className="text-muted-foreground">AI-generated weekly summary of your emotional activity and personalized insights.</p>
        <Badge variant="outline" className="mt-2 gap-1"><Sparkles className="h-3 w-3" /> 10 Credits per Report</Badge>
      </motion.div>

      {/* This Week Summary */}
      {weeklyData && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> This Week's Activity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Mood Logs", value: weeklyData.moodEntries },
              { label: "Avg Mood", value: weeklyData.avgMood },
              { label: "Meditations", value: weeklyData.meditations },
              { label: "Med. Minutes", value: weeklyData.totalMedMin },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-xl font-black text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {weeklyData.topTags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2">Top emotions this week:</p>
              <div className="flex gap-2 flex-wrap">
                {weeklyData.topTags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Generate Button */}
      <Button onClick={generateReport} disabled={generating} size="lg" className="w-full gap-2">
        {generating ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Generating AI Report...</>
        ) : (
          <><Brain className="h-5 w-5" /> Generate Weekly Report (10 credits)</>
        )}
      </Button>

      {/* Selected Report */}
      {selectedReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> AI Wellness Report</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{selectedReport.report || selectedReport.analysis || "Report content unavailable."}</ReactMarkdown>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Report History */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Previous Reports</h3>
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => setSelectedReport(r)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Week of {format(new Date(r.created_at), "MMM dd, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{r.mood_entries_count || 0} mood entries analyzed</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{r.credits_used || 10} credits</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
