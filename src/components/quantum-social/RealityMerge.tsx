import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Merge, Loader2, ThumbsUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import ReactMarkdown from "react-markdown";

interface MergedReality {
  id: string;
  user_id: string;
  merged_content: string;
  merge_type: string;
  votes_count: number;
  created_at: string;
}

export function RealityMerge({ onBack }: { onBack: () => void }) {
  const [merges, setMerges] = useState<MergedReality[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [reality1, setReality1] = useState("");
  const [reality2, setReality2] = useState("");
  const { toast } = useToast();
  const { spendCredit } = useAICredits();

  useEffect(() => { fetchMerges(); }, []);

  const fetchMerges = async () => {
    const { data } = await supabase.from("quantum_reality_merges").select("*").order("votes_count", { ascending: false }).limit(30);
    setMerges((data as MergedReality[]) || []);
    setLoading(false);
  };

  const createMerge = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!reality1.trim() || !reality2.trim()) { toast({ title: "Both realities required", variant: "destructive" }); return; }

    const hasCredits = await spendCredit("custom_generation", "Reality Merge");
    if (!hasCredits) { toast({ title: "Not enough credits (2 required)", variant: "destructive" }); return; }

    setCreating(true);
    try {
      const response = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: [{ role: "user", content: `Merge these two quantum realities into a creative hybrid:\n\nReality A: "${reality1}"\nReality B: "${reality2}"\n\nCreate a vivid, engaging merged reality that combines elements from both. Include quantum physics metaphors. 2-3 paragraphs.` }],
          systemPrompt: "You are a Quantum Reality Merger. You combine two different versions of reality into creative hybrids using quantum physics concepts. Be vivid and imaginative.",
        },
      });

      let mergedContent = `**Merged Reality** 🌀\n\nReality A and Reality B have been entangled through quantum superposition, creating a new hybrid timeline where both truths coexist simultaneously.\n\n**Reality A:** ${reality1}\n\n**Reality B:** ${reality2}\n\n*The observer effect has collapsed these realities into a unified quantum state.*`;

      if (response.data) {
        try {
          if (typeof response.data === 'string') {
            let text = "";
            const lines = response.data.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try { const p = JSON.parse(line.slice(6)); const d = p.choices?.[0]?.delta?.content; if (d) text += d; } catch {}
              }
            }
            if (text) mergedContent = text;
          } else if (response.data.choices?.[0]?.message?.content) {
            mergedContent = response.data.choices[0].message.content;
          }
        } catch {}
      }

      await supabase.from("quantum_reality_merges").insert({
        user_id: user.id,
        source_post_ids: [],
        merged_content: mergedContent,
        merge_type: "hybrid",
      });

      toast({ title: "Realities Merged! 🌀" });
      setReality1("");
      setReality2("");
      setShowCreate(false);
      fetchMerges();
    } catch (error) {
      toast({ title: "Merge Failed", variant: "destructive" });
    }
    setCreating(false);
  };

  const voteMerge = async (mergeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("quantum_reality_merges").update({ votes_count: merges.find(m => m.id === mergeId)!.votes_count + 1 }).eq("id", mergeId);
    fetchMerges();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Merge className="h-5 w-5 text-pink-400" /> Reality Merge</h2>
            <p className="text-xs text-muted-foreground">Hybridize two realities into one</p>
          </div>
        </div>
        <Badge variant="outline" className="border-pink-500/30 text-pink-400">2 credits/merge</Badge>
      </div>

      <Button onClick={() => setShowCreate(!showCreate)} className="w-full bg-pink-600 hover:bg-pink-700">
        <Sparkles className="h-4 w-4 mr-2" /> Create Reality Merge
      </Button>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 space-y-3">
          <Textarea placeholder="Reality A — describe the first version of events..." value={reality1} onChange={e => setReality1(e.target.value)} className="border-pink-500/20" rows={2} />
          <Textarea placeholder="Reality B — describe an alternative version..." value={reality2} onChange={e => setReality2(e.target.value)} className="border-pink-500/20" rows={2} />
          <Button onClick={createMerge} disabled={creating} className="w-full">
            {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> AI Merging Realities...</> : "Merge Realities (2 credits)"}
          </Button>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading merged realities...</div>
      ) : merges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Merge className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No merged realities yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {merges.map((merge, i) => (
            <motion.div key={merge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-violet-500/5 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] capitalize border-pink-500/30 text-pink-400">{merge.merge_type}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(merge.created_at).toLocaleDateString()}</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-sm">
                <ReactMarkdown>{merge.merged_content}</ReactMarkdown>
              </div>
              <Button size="sm" variant="outline" onClick={() => voteMerge(merge.id)} className="border-pink-500/20">
                <ThumbsUp className="h-3 w-3 mr-1" /> {merge.votes_count}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
