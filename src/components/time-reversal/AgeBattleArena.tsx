import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Swords, Trophy, ThumbsUp, Upload, Loader2, Check, Flame, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { BattleResultDialog, type BattleResult } from "@/components/holographic/BattleResultDialog";

interface Props { onBack: () => void; }

const BATTLE_MODES = [
  { id: "1v1", name: "1v1 Duel", icon: Swords, desc: "One AI opponent, 3 rounds", entry: HOLO_COSTS.battle_1v1, prize: "+4 credits" },
  { id: "survival", name: "Survival", icon: Flame, desc: "Endurance run, 4 rounds", entry: HOLO_COSTS.battle_survival, prize: "+15 credits" },
  { id: "tournament", name: "Tournament", icon: Trophy, desc: "Toughest opponents, 5 rounds", entry: HOLO_COSTS.battle_tournament, prize: "+30 credits" },
];

type EntryStage = "idle" | "auth" | "upload" | "publish" | "done";

const ENTRY_STEPS: { key: EntryStage; label: string; pct: number }[] = [
  { key: "auth", label: "Checking your session", pct: 15 },
  { key: "upload", label: "Uploading your transformation photo", pct: 55 },
  { key: "publish", label: "Creating your battle entry", pct: 85 },
  { key: "done", label: "Entry is live in the arena", pct: 100 },
];

export function AgeBattleArena({ onBack }: Props) {
  const { toast } = useToast();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [entryStage, setEntryStage] = useState<EntryStage>("idle");

  const entryIndex = ENTRY_STEPS.findIndex((s) => s.key === entryStage);
  const entryPct = entryIndex >= 0 ? ENTRY_STEPS[entryIndex].pct : 0;

  useEffect(() => { loadBattles(); }, []);

  const loadBattles = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("time_reversal_posts")
        .select("*")
        .ilike("content", "%Battle entry%")
        .order("likes_count", { ascending: false })
        .limit(10);
      setBattles(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitEntry = async () => {
    if (!selectedFile) {
      toast({ title: "Select a photo", description: "Upload your reverse-aging transformation photo", variant: "destructive" });
      return;
    }
    setUploading(true);
    setEntryStage("auth");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }

      setEntryStage("upload");
      const ext = (selectedFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${session.user.id}/time-reversal/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, selectedFile, { contentType: selectedFile.type || "image/jpeg", upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      setEntryStage("publish");
      const { error: insertError } = await supabase.from("time_reversal_posts").insert({
        user_id: session.user.id,
        content: "Battle entry - My reverse aging transformation! 🔄",
        image_url: publicUrl,
        age_at_post: 30,
        likes_count: 0,
        comments_count: 0 } as any);
      if (insertError) throw insertError;

      setEntryStage("done");
      toast({ title: "Entry Submitted!", description: "Your battle entry is now live. Good luck!" });
      setSelectedFile(null);
      loadBattles();
    } catch (e: any) {
      console.error(e);
      setEntryStage("idle");
      toast({ title: "Error", description: e?.message || "Failed to submit entry", variant: "destructive" });
    } finally { setUploading(false); }
  };


  // One vote per person — the RPC toggles a unique like row and keeps the counter correct.
  const handleVote = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }
      const { data, error } = await supabase.rpc("toggle_time_reversal_like", { _post_id: postId });
      if (error) throw error;
      const liked = (data as any)?.liked ?? (data as any)?.[0]?.liked;
      toast({ title: liked === false ? "Vote removed" : "Vote cast! ⚔️" });
      loadBattles();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "Could not vote", variant: "destructive" });
    }
  };

  const handleFight = async (mode: typeof BATTLE_MODES[0]) => {
    setFighting(mode.id);
    try {
      const paid = await spend(mode.entry, `age_battle_${mode.id}`);
      if (!paid) return;
      const { data, error } = await supabase.functions.invoke("holographic-battle-simulate", {
        body: { mode: mode.id },
      });
      if (error) throw error;
      const r = data?.result;
      if (r) { setReport({ result: r as BattleResult, mode }); await refresh(); }
      else toast({ title: "Battle entered", description: `${mode.name} — ${mode.entry} credits used.` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "Battle failed", variant: "destructive" });
    } finally { setFighting(null); }
  };


  return (
    <>
      <FloatingHowItWorks
        title='Age Battle Arena'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Age Battle Arena panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Age Battle Arena</h2>
          <p className="text-sm text-muted-foreground">Compare reverse-aging transformations & vote for the best!</p>
        </div>
      </div>

      {/* Submit Entry */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
        <CardHeader><CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5 text-purple-400" /> Submit Your Entry</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center">
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="battle-upload" />
            <label htmlFor="battle-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm text-muted-foreground">{selectedFile ? selectedFile.name : "Upload your transformation photo"}</p>
            </label>
          </div>
          <Button onClick={handleSubmitEntry} disabled={uploading || !selectedFile} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Enter Battle ⚔️"}
          </Button>

          {entryStage !== "idle" && (
            <div className="space-y-3 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>{entryStage === "done" ? "Completed" : "Working..."}</span>
                <span className="text-muted-foreground">{entryPct}%</span>
              </div>
              <Progress value={entryPct} className="h-2" />
              <ul className="space-y-1.5">
                {ENTRY_STEPS.map((s, i) => {
                  const active = i === entryIndex;
                  const done = i < entryIndex;
                  return (
                    <li key={s.key} className={`flex items-center gap-2 text-xs ${active ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                      {done ? <Check className="h-3.5 w-3.5 text-purple-400" />
                        : active ? <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                        : <span className="h-3.5 w-3.5 rounded-full border border-current" />}
                      {s.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> Battle Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" /></div>
          ) : battles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No battle entries yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {battles.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/40">
                  <div className={`text-2xl font-black ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </div>
                  {entry.image_url && <img src={entry.image_url} alt="Entry" className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{entry.likes_count || 0} votes</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleVote(entry.id)}>
                    <ThumbsUp className="h-4 w-4 mr-1" /> Vote
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
