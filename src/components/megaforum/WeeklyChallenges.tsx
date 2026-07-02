import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Flame, Target, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface WeeklyChallengesProps {
  onBack: () => void;
}

const CHALLENGE_TYPES = [
  { value: "posting", label: "Create Posts", icon: "📝" },
  { value: "commenting", label: "Write Comments", icon: "💬" },
  { value: "likes", label: "Give Likes", icon: "❤️" },
  { value: "debates", label: "Join Debates", icon: "⚔️" },
  { value: "polls", label: "Vote in Polls", icon: "📊" },
];

export const WeeklyChallenges = ({ onBack }: WeeklyChallengesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState("posting");
  const [targetValue, setTargetValue] = useState("5");
  const [karmaReward, setKarmaReward] = useState("50");

  const { data: challenges = [] } = useQuery({
    queryKey: ["forum-challenges"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_challenges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myProgress = {} } = useQuery({
    queryKey: ["forum-challenge-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      const { data, error } = await (supabase as any)
        .from("forum_challenge_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((p: any) => { map[p.challenge_id] = p; });
      return map;
    },
  });

  const createChallenge = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await (supabase as any).from("forum_challenges").insert({
        title,
        description,
        challenge_type: challengeType,
        target_value: parseInt(targetValue),
        karma_reward: parseInt(karmaReward),
        ends_at: endsAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-challenges"] });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      toast({ title: "Challenge created!" });
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { error } = await (supabase as any).from("forum_challenge_progress").insert({
        user_id: user.id,
        challenge_id: challengeId,
        current_value: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-challenge-progress"] });
      toast({ title: "Challenge joined!" });
    },
  });

  const getTypeInfo = (type: string) => CHALLENGE_TYPES.find(t => t.value === type) || CHALLENGE_TYPES[0];
  const isExpired = (endsAt: string) => new Date(endsAt) < new Date();
  const daysLeft = (endsAt: string) => Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Weekly Challenges"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Challenge
        </Button>
      </div>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        🔥 Weekly Challenges
      </h2>

      {showCreate && (
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Challenge title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Select value={challengeType} onValueChange={setChallengeType}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHALLENGE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Target" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="text-xs" />
              <Input type="number" placeholder="Karma" value={karmaReward} onChange={(e) => setKarmaReward(e.target.value)} className="text-xs" />
            </div>
            <Button onClick={() => createChallenge.mutate()} disabled={!title.trim() || createChallenge.isPending} className="w-full">
              {createChallenge.isPending ? "Creating..." : "Launch Challenge"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {challenges.map((challenge: any, i: number) => {
          const progress = myProgress[challenge.id];
          const typeInfo = getTypeInfo(challenge.challenge_type);
          const expired = isExpired(challenge.ends_at);
          const pct = progress ? Math.min(100, (progress.current_value / challenge.target_value) * 100) : 0;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`bg-card/80 backdrop-blur-xl border-primary/10 ${expired ? "opacity-60" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={expired ? "secondary" : "default"} className="text-[10px]">
                        {expired ? "Ended" : `${daysLeft(challenge.ends_at)}d left`}
                      </Badge>
                      <p className="text-xs text-accent font-bold mt-1">+{challenge.karma_reward} karma</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {typeInfo.label}: {challenge.target_value}</span>
                  </div>

                  {progress ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{progress.current_value} / {challenge.target_value}</span>
                        {progress.completed && (
                          <span className="text-primary flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Completed!
                          </span>
                        )}
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  ) : !expired ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => joinChallenge.mutate(challenge.id)}
                      disabled={joinChallenge.isPending}
                    >
                      <Flame className="h-3.5 w-3.5 mr-1" /> Join Challenge
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {challenges.length === 0 && (
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardContent className="text-center py-10 text-muted-foreground">
              No active challenges. Create one to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
