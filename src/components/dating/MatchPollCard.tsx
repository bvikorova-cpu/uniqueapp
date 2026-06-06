import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Poll {
  id: string;
  author_id: string;
  question: string;
  options: { text: string }[];
}
interface Vote { poll_id: string; voter_id: string; option_index: number; }

export const MatchPollCard = ({ matchId, userId }: { matchId: string; userId: string }) => {
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState<string[]>(["", ""]);

  const load = async () => {
    const { data: ps } = await (supabase as any).from("dating_polls")
      .select("*").eq("match_id", matchId).order("created_at", { ascending: false });
    setPolls((ps || []) as Poll[]);
    const ids = (ps || []).map((p: any) => p.id);
    if (ids.length) {
      const { data: vs } = await (supabase as any).from("dating_poll_votes")
        .select("*").in("poll_id", ids);
      setVotes(vs || []);
    } else setVotes([]);
  };

  useEffect(() => { load(); }, [matchId]);

  const create = async () => {
    const clean = opts.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) { toast({ title: "Need question + 2 options", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("dating_polls").insert({
      match_id: matchId, author_id: userId, question: question.trim(),
      options: clean.map(text => ({ text })),
    });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    setQuestion(""); setOpts(["", ""]); setOpen(false); load();
  };

  const vote = async (pollId: string, idx: number) => {
    const { error } = await (supabase as any).from("dating_poll_votes")
      .insert({ poll_id: pollId, voter_id: userId, option_index: idx });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    load();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("dating_polls").delete().eq("id", id);
    load();
  };

  return (
    <Card className="p-3 space-y-3 bg-primary/5 border-primary/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Polls</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline" className="h-7 gap-1"><Plus className="h-3 w-3" /> New</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Quick poll</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Question</Label><Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pizza or sushi?" /></div>
              {opts.map((o, i) => (
                <div key={i}>
                  <Label>Option {i + 1}</Label>
                  <Input value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }} />
                </div>
              ))}
              {opts.length < 4 && <Button size="sm" variant="ghost" onClick={() => setOpts([...opts, ""])}>+ Add option</Button>}
              <Button onClick={create} className="w-full">Create poll</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {polls.length === 0 && <p className="text-xs text-muted-foreground">No polls yet. Break the ice!</p>}

      {polls.map((p) => {
        const pVotes = votes.filter(v => v.poll_id === p.id);
        const myVote = pVotes.find(v => v.voter_id === userId);
        const total = pVotes.length || 1;
        return (
          <div key={p.id} className="rounded-lg bg-background/60 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{p.question}</p>
              {p.author_id === userId && (
                <button onClick={() => remove(p.id)}><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
              )}
            </div>
            <div className="space-y-1.5">
              {p.options.map((o, i) => {
                const count = pVotes.filter(v => v.option_index === i).length;
                const pct = Math.round((count / total) * 100);
                const mine = myVote?.option_index === i;
                return (
                  <button
                    key={i}
                    disabled={!!myVote}
                    onClick={() => vote(p.id, i)}
                    className={`relative w-full text-left rounded-md border px-3 py-2 text-xs overflow-hidden transition-colors ${mine ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
                  >
                    {myVote && <div className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${pct}%` }} />}
                    <div className="relative flex justify-between">
                      <span>{o.text}</span>
                      {myVote && <span className="font-medium">{pct}% · {count}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </Card>
  );
};
