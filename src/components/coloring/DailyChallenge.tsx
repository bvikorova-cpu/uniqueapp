import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Trophy, Star, Clock, Users, Zap, Upload, Award } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function DailyChallenge() {
  const queryClient = useQueryClient();
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's challenge
  const { data: challenge, isLoading: challengeLoading } = useQuery({
    queryKey: ["coloring-daily-challenge"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("coloring_daily_challenges")
        .select("*")
        .eq("challenge_date", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Get submissions for today's challenge
  const { data: submissions } = useQuery({
    queryKey: ["coloring-challenge-submissions", challenge?.id],
    queryFn: async () => {
      if (!challenge) return [];
      const { data, error } = await supabase
        .from("coloring_challenge_submissions")
        .select("*")
        .eq("challenge_id", challenge.id)
        .order("created_at", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!challenge,
  });

  // Check if user already submitted
  const { data: mySubmission } = useQuery({
    queryKey: ["coloring-my-submission", challenge?.id],
    queryFn: async () => {
      if (!challenge) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("coloring_challenge_submissions")
        .select("*")
        .eq("challenge_id", challenge.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!challenge,
  });

  const handleSubmit = async () => {
    if (!submissionFile || !challenge) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = submissionFile.name.split(".").pop();
      const fileName = `challenges/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("coloring-images").upload(fileName, submissionFile);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("coloring-images").getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("coloring-ai-tools", {
        body: {
          action: "submit-challenge",
          challengeId: challenge.id,
          imageUrl: publicUrl,
          xpReward: challenge.xp_reward,
        },
      });
      if (error) throw error;
      toast.success(`Challenge submitted! +${challenge.xp_reward} XP earned!`);
      setSubmissionFile(null);
      queryClient.invalidateQueries({ queryKey: ["coloring-challenge-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["coloring-my-submission"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challengeLoading) {
    return (<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>);
  }

  if (!challenge) {
    return (
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg font-medium">No Challenge Today</p>
          <p className="text-sm text-muted-foreground">Check back tomorrow for a new daily challenge!</p>
        </CardContent>
      </Card>
    );
  }

  const diffColor = challenge.difficulty === "easy" ? "text-emerald-500" : challenge.difficulty === "hard" ? "text-red-500" : "text-amber-500";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Challenge Card */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-red-500/30 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              Daily Challenge
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" /> Today
            </Badge>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Challenge Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Star className={`w-5 h-5 mx-auto mb-1 ${diffColor}`} />
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <p className="text-sm font-bold capitalize">{challenge.difficulty}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-muted-foreground">Reward</p>
              <p className="text-sm font-bold">{challenge.xp_reward} XP</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="text-sm font-bold">{submissions?.length || 0}</p>
            </div>
          </div>

          {/* Theme */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-xl border border-amber-500/20">
            <p className="text-xs text-muted-foreground mb-1">Today's Theme</p>
            <p className="text-xl font-black">{challenge.theme}</p>
          </div>

          {/* Sample Image */}
          {challenge.sample_image_url && (
            <div>
              <p className="text-sm font-medium mb-2">Sample Reference</p>
              <img src={challenge.sample_image_url} alt="Challenge sample" className="w-full max-w-sm mx-auto rounded-xl border border-border/30" />
            </div>
          )}

          {/* Submission */}
          {mySubmission ? (
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-semibold text-emerald-600">Challenge Completed!</p>
              <p className="text-sm text-muted-foreground">You earned {mySubmission.xp_earned} XP</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Submit Your Entry</p>
              <Input type="file" accept="image/*" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} className="rounded-xl" />
              <Button onClick={handleSubmit} disabled={!submissionFile || isSubmitting} className="w-full rounded-xl">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Upload className="mr-2 h-4 w-4" /> Submit Entry</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard / Submissions */}
      {submissions && submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Submissions ({submissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {submissions.map((sub, i) => (
                <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="relative rounded-lg overflow-hidden border border-border/30">
                    <img src={sub.image_url} alt={`Submission ${i + 1}`} className="w-full aspect-square object-cover" />
                    {i < 3 && (
                      <div className="absolute top-1 left-1">
                        <Badge className={`text-[10px] ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-amber-700"}`}>
                          #{i + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
