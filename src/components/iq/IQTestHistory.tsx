import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, ChevronUp, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface TestRow {
  id: string;
  iq_score: number | null;
  score: number | null;
  percentile: number | null;
  category: string | null;
  total_questions: number | null;
  correct_count: number | null;
  time_taken: number | null;
  completed_at: string;
  sub_scores: Record<string, number> | null;
}

export default function IQTestHistory() {
  const [rows, setRows] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("iq_test_results")
        .select("id, iq_score, score, percentile, category, total_questions, correct_count, time_taken, completed_at, sub_scores")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(50);
      setRows((data as unknown as TestRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <>
      <FloatingHowItWorks title="How IQTest History works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-purple-500" /> Test History</CardTitle>
        <CardDescription>Your last {rows.length} IQ tests with full breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No tests taken yet. Start with any IQ test above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const open = openId === r.id;
              const acc = r.total_questions ? Math.round(((r.correct_count ?? 0) / r.total_questions) * 100) : null;
              return (
                <div key={r.id} className="border border-border/40 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/40 transition text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
                      {r.iq_score ?? "—"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm capitalize">{r.category ?? "general"}</span>
                        {r.percentile != null && (
                          <Badge variant="outline" className="text-[10px]">Top {(100 - Number(r.percentile)).toFixed(1)}%</Badge>
                        )}
                        {acc != null && <Badge variant="outline" className="text-[10px]">{acc}% acc</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{new Date(r.completed_at).toLocaleString()}</p>
                    </div>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-muted/20 border-t border-border/40 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <Stat label="IQ Score" value={r.iq_score ?? "—"} />
                            <Stat label="Percentile" value={r.percentile != null ? Number(r.percentile).toFixed(1) : "—"} />
                            <Stat label="Correct" value={`${r.correct_count ?? 0}/${r.total_questions ?? 0}`} />
                            <Stat label="Time" value={r.time_taken ? `${Math.round(r.time_taken / 60)}m` : "—"} icon={Clock} />
                          </div>
                          {r.sub_scores && Object.keys(r.sub_scores).length > 0 && (
                            <div>
                              <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Target className="h-3 w-3" /> Cognitive breakdown</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(r.sub_scores).map(([k, v]) => (
                                  <div key={k} className="bg-background/60 rounded px-2 py-1.5">
                                    <p className="text-[10px] text-muted-foreground capitalize">{k}</p>
                                    <p className="text-sm font-bold">{Math.round(Number(v))}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
}

function Stat({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) {
  return (
    <div className="bg-background/60 rounded px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">{Icon && <Icon className="h-3 w-3" />}{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
