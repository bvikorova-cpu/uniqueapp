import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Rewind, History, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TimeTravelLog {
  id: string;
  user_id: string;
  viewed_version: number;
  timeline_branch: string;
  credits_used: number;
  traveled_at: string;
  content?: string;
}

const BRANCHES = ["alpha", "beta", "gamma", "delta", "omega"];
const BRANCH_COLORS: Record<string, string> = {
  alpha: "text-cyan-400 border-cyan-500/30",
  beta: "text-violet-400 border-violet-500/30",
  gamma: "text-emerald-400 border-emerald-500/30",
  delta: "text-pink-400 border-pink-500/30",
  omega: "text-amber-400 border-amber-500/30",
};

export function QuantumTimeTravel({ onBack }: { onBack: () => void }) {
  const [logs, setLogs] = useState<TimeTravelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [traveling, setTraveling] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("alpha");
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("quantum_time_travel_logs").select("*").eq("user_id", user.id).order("traveled_at", { ascending: false }).limit(20);
    setLogs((data as TimeTravelLog[]) || []);
    setLoading(false);
  };

  const timeTravel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!query.trim()) { toast({ title: "Enter what to explore", variant: "destructive" }); return; }

    const hasCredits = await spendCredit("custom_generation", "Quantum Time Travel");
    if (!hasCredits) { toast({ title: "Not enough credits (1 required)", variant: "destructive" }); return; }

    setTraveling(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: [{ role: "user", content: `Time travel query: "${query}" in timeline branch "${selectedBranch}". Describe what this post/event/moment looked like in a previous version of quantum reality. Use quantum physics metaphors. Include a "Timeline Branch: ${selectedBranch}" header. Be creative and immersive. 2-3 paragraphs.` }],
          systemPrompt: "You are a Quantum Time Travel Engine. You show users previous versions of quantum reality. Each timeline branch (alpha, beta, gamma, delta, omega) shows a different historical version. Be vivid, mysterious, and use quantum physics language.",
        },
      });

      let content = `## Timeline Branch: ${selectedBranch.toUpperCase()}\n\n⏳ *Traveling through the quantum field...*\n\nIn the ${selectedBranch} timeline, "${query}" manifested differently. The wave function hadn't yet collapsed, and multiple possibilities coexisted in superposition.\n\nThis version of reality shows a more primal form of the event — before observers shaped it into its current state. The quantum echoes reveal patterns hidden from linear time perception.\n\n*Quantum coherence maintained for 3.7 nanoseconds before decoherence.*`;

      if (response.data) {
        try {
          if (typeof response.data === 'string') {
            let text = "";
            for (const line of response.data.split('\n')) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try { const p = JSON.parse(line.slice(6)); const d = p.choices?.[0]?.delta?.content; if (d) text += d; } catch {}
              }
            }
            if (text) content = text;
          } else if (response.data.choices?.[0]?.message?.content) {
            content = response.data.choices[0].message.content;
          }
        } catch {}
      }

      setResult(content);

      await supabase.from("quantum_time_travel_logs").insert({
        user_id: user.id,
        viewed_version: Math.floor(Math.random() * 99) + 1,
        timeline_branch: selectedBranch,
        credits_used: 1,
      });

      fetchLogs();
    } catch {
      toast({ title: "Time travel failed", variant: "destructive" });
    }
    setTraveling(false);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Time Travel'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Time Travel panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-cyan-400" /> Quantum Time Travel</h2>
            <p className="text-xs text-muted-foreground">View historical versions of collapsed posts</p>
          </div>
        </div>
        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">1 credit/trip</Badge>
      </div>

      {/* Branch selector */}
      <div className="flex gap-2 flex-wrap">
        {BRANCHES.map(b => (
          <Button key={b} size="sm" variant={selectedBranch === b ? "default" : "outline"}
            className={`capitalize text-xs ${selectedBranch !== b ? BRANCH_COLORS[b] : ""}`}
            onClick={() => setSelectedBranch(b)}
          >{b}</Button>
        ))}
      </div>

      {/* Travel input */}
      <div className="flex gap-2">
        <Input placeholder="What moment do you want to revisit?" value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !traveling && timeTravel()} className="border-cyan-500/20"
        />
        <Button onClick={timeTravel} disabled={traveling} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
          {traveling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rewind className="h-4 w-4" />}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-5"
        >
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><History className="h-4 w-4" /> Travel History</h3>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No time travels yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`rounded-lg border p-3 flex items-center justify-between ${BRANCH_COLORS[log.timeline_branch] || "border-white/10"}`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  <div>
                    <p className="text-xs font-semibold capitalize">{log.timeline_branch} branch</p>
                    <p className="text-[10px] text-muted-foreground">Version #{log.viewed_version}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(log.traveled_at).toLocaleDateString()}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
