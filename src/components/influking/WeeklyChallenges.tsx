import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Clock, Users, Loader2, Flame, Medal, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WeeklyChallengesProps {
  onBack: () => void;
}

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward_credits: number;
  reward_badge: string | null;
  ends_at: string;
  participants_count: number;
};

const WeeklyChallenges = ({ onBack }: WeeklyChallengesProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showSubmit, setShowSubmit] = useState(false);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  const { data: userId } = useQuery({ queryKey: ["auth-uid"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["influking-weekly-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influking_weekly_challenges")
        .select("id,title,description,category,difficulty,reward_credits,reward_badge,ends_at,participants_count")
        .eq("is_active", true)
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Challenge[];
    } });

  const { data: joined = new Set<string>() } = useQuery({
    queryKey: ["influking-my-joins", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("influking_challenge_participants")
        .select("challenge_id").eq("user_id", userId!);
      return new Set((data ?? []).map((r: any) => r.challenge_id as string));
    } });

  const { data: mySubs = [] } = useQuery({
    queryKey: ["influking-my-subs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("influking_challenge_submissions")
        .select("id,challenge_id,status,reward_credits_granted,created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    } });

  const joinMut = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!userId) throw new Error("Sign in required");
      const { error } = await supabase.from("influking_challenge_participants")
        .insert({ challenge_id: challengeId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influking-my-joins"] });
      qc.invalidateQueries({ queryKey: ["influking-weekly-challenges"] });
      toast({ title: "✅ Joined!", description: "Good luck — submit your entry before the deadline." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }) });

  const leaveMut = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!userId) throw new Error("Sign in required");
      const { error } = await supabase.from("influking_challenge_participants")
        .delete().eq("challenge_id", challengeId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influking-my-joins"] });
      qc.invalidateQueries({ queryKey: ["influking-weekly-challenges"] });
    } });

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!userId || !selected) throw new Error("Missing data");
      if (!/^https?:\/\/.+/i.test(url.trim())) throw new Error("Enter a valid URL");
      const { error } = await supabase.from("influking_challenge_submissions").insert({ challenge_id: selected.id, user_id: userId,
        submission_url: url.trim(), note: note.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Submitted", description: "Entry queued for review. Approved entries pay out credits automatically." });
      setShowSubmit(false); setUrl(""); setNote("");
      qc.invalidateQueries({ queryKey: ["influking-my-subs"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }) });

  const diffColor = (d: string) =>
    d === "Easy" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : d === "Medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : "bg-red-500/10 text-red-600 border-red-500/20";

  const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

  const statusFor = (challengeId: string) => {
    const s = (mySubs as any[]).find(x => x.challenge_id === challengeId);
    return s?.status as ("pending" | "approved" | "rejected" | "paid" | undefined);
  };

  return (
    <>
      <FloatingHowItWorks title="Weekly Challenges - How it works" steps={[
        { title: "Join", desc: "Pick an active challenge and press Join." },
        { title: "Create", desc: "Post your entry on your channel or the Unique Wall." },
        { title: "Submit", desc: "Paste the URL of your post before the deadline." },
        { title: "Reward", desc: "Approved entries get credits paid automatically to your wallet." },
      ]} />
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
        </motion.div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Weekly Challenges</h2>
            <p className="text-muted-foreground">Compete, create, and win real credits</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        )}

        {!isLoading && challenges.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">No active challenges right now. Check back soon!</Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c, i) => {
            const isJoined = joined.has(c.id);
            const st = statusFor(c.id);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/30 transition-all h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${diffColor(c.difficulty)} border text-[10px]`}>{c.difficulty}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /><span>{daysLeft(c.ends_at)}d left</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-base mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">{c.description}</p>
                    <div className="flex items-center gap-1 mb-2 text-xs">
                      <Medal className="h-3 w-3 text-amber-500" />
                      <span className="font-medium text-amber-600">
                        +{c.reward_credits} credits{c.reward_badge ? ` · ${c.reward_badge}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span>{c.participants_count} joined</span></div>
                      <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                    </div>

                    {st === "paid" && (
                      <Badge className="w-full justify-center bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border py-2 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Paid out
                      </Badge>
                    )}
                    {st === "approved" && (
                      <Badge className="w-full justify-center bg-blue-500/10 text-blue-600 border-blue-500/20 border py-2">Approved</Badge>
                    )}
                    {st === "rejected" && (
                      <Badge className="w-full justify-center bg-red-500/10 text-red-600 border-red-500/20 border py-2 gap-1">
                        <XCircle className="h-3 w-3" /> Not accepted
                      </Badge>
                    )}
                    {st === "pending" && (
                      <Badge className="w-full justify-center bg-amber-500/10 text-amber-600 border-amber-500/20 border py-2">Under review</Badge>
                    )}

                    {!st && isJoined && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1"
                          onClick={() => { setSelected(c); setShowSubmit(true); }}>
                          <Upload className="h-3 w-3" /> Submit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => leaveMut.mutate(c.id)} disabled={leaveMut.isPending}>
                          Leave
                        </Button>
                      </div>
                    )}
                    {!st && !isJoined && (
                      <Button size="sm" className="w-full gap-1"
                        onClick={() => joinMut.mutate(c.id)} disabled={joinMut.isPending || !userId}>
                        {joinMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Flame className="h-3 w-3" />}
                        {userId ? "Join Challenge" : "Sign in to join"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Submit Challenge Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected?.title}</p>
              <div>
                <label className="text-sm font-medium mb-1 block">Post / content URL</label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Note (optional)</label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>
              <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending || !url.trim()} className="w-full gap-2">
                {submitMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {submitMut.isPending ? "Submitting..." : "Submit Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default WeeklyChallenges;
