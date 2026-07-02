import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Clock, Users, Plus, Loader2, Flame, Medal, Star, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WeeklyChallengesProps {
  onBack: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: string;
  participants: number;
  deadline: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isJoined: boolean;
}

const CHALLENGES: Challenge[] = [
  { id: "1", title: "7-Day Consistency Sprint", description: "Post content every single day for 7 days straight. Quality matters!", category: "All", reward: "50 Credits + Verified Badge Boost", participants: 234, deadline: "2026-04-05", difficulty: "Medium", isJoined: false },
  { id: "2", title: "Viral Reel Challenge", description: "Create a reel that gets 1,000+ views in 48 hours. Use trending audio and hooks.", category: "Video", reward: "100 Credits + Featured Spot", participants: 567, deadline: "2026-04-03", difficulty: "Hard", isJoined: false },
  { id: "3", title: "Engagement Booster", description: "Get 50+ comments on a single post. Ask questions, create polls, be interactive!", category: "Engagement", reward: "30 Credits", participants: 189, deadline: "2026-04-07", difficulty: "Easy", isJoined: false },
  { id: "4", title: "Collab Creator", description: "Partner with another influencer and create a joint post or video.", category: "Collaboration", reward: "75 Credits + Collab Badge", participants: 98, deadline: "2026-04-10", difficulty: "Medium", isJoined: false },
  { id: "5", title: "Story Marathon", description: "Post 20 stories in one day documenting your creative process.", category: "Stories", reward: "40 Credits", participants: 312, deadline: "2026-04-04", difficulty: "Easy", isJoined: false },
  { id: "6", title: "Trend Setter", description: "Start a new trend or challenge that other influencers join. Most creative wins!", category: "Trending", reward: "200 Credits + Crown Badge", participants: 45, deadline: "2026-04-12", difficulty: "Hard", isJoined: false },
];

const WeeklyChallenges = ({ onBack }: WeeklyChallengesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-challenges"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "challenge_joined",
        target_type: "weekly_challenge",
        target_id: challengeId,
        metadata: { challenge_title: CHALLENGES.find(c => c.id === challengeId)?.title },
      });
      if (error) throw error;
    },
    onSuccess: (_, challengeId) => {
      setJoinedChallenges(prev => new Set(prev).add(challengeId));
      toast({ title: "✅ Challenge Joined!", description: "Good luck! Complete it before the deadline." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const submitEntry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedChallenge) throw new Error("Missing data");

      const { error } = await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "challenge_submission",
        target_type: "weekly_challenge",
        target_id: selectedChallenge.id,
        metadata: {
          challenge_title: selectedChallenge.title,
          submission_url: submissionUrl,
          note: submissionNote,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Submission Received!", description: "Your entry is being reviewed. Winners announced weekly!" });
      setShowSubmitDialog(false);
      setSubmissionUrl("");
      setSubmissionNote("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getDifficultyColor = (d: string) => {
    if (d === "Easy") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (d === "Medium") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <>
      <FloatingHowItWorks title={"Weekly Challenges - How it works"} steps={[{ title: 'Open', desc: 'Access the Weekly Challenges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weekly Challenges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Weekly Challenges</h2>
            <p className="text-muted-foreground">Compete, create, and win credits & badges</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHALLENGES.map((challenge, i) => {
          const daysLeft = getDaysLeft(challenge.deadline);
          const isJoined = joinedChallenges.has(challenge.id);
          return (
            <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/30 transition-all h-full flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getDifficultyColor(challenge.difficulty)} border text-[10px]`}>
                      {challenge.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{daysLeft}d left</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base mb-2">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1">{challenge.description}</p>

                  <div className="flex items-center gap-1 mb-2 text-xs">
                    <Medal className="h-3 w-3 text-amber-500" />
                    <span className="font-medium text-amber-500">{challenge.reward}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{challenge.participants} joined</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{challenge.category}</Badge>
                  </div>

                  {isJoined ? (
                    <div className="space-y-2">
                      <Progress value={30} className="h-2" />
                      <Button size="sm" className="w-full gap-1" variant="outline"
                        onClick={() => { setSelectedChallenge(challenge); setShowSubmitDialog(true); }}>
                        <Upload className="h-3 w-3" /> Submit Entry
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full gap-1"
                      onClick={() => joinChallenge.mutate(challenge.id)}
                      disabled={joinChallenge.isPending}>
                      {joinChallenge.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Flame className="h-3 w-3" />}
                      Join Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Submit Challenge Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedChallenge?.title}</p>
            <div>
              <label className="text-sm font-medium mb-1 block">Post/Content URL</label>
              <Input value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="Link to your challenge entry post..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Note (optional)</label>
              <Textarea value={submissionNote} onChange={(e) => setSubmissionNote(e.target.value)}
                placeholder="Anything you'd like to add about your entry..." rows={3} />
            </div>
            <Button onClick={() => submitEntry.mutate()} disabled={submitEntry.isPending || !submissionUrl.trim()} className="w-full gap-2">
              {submitEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {submitEntry.isPending ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default WeeklyChallenges;
