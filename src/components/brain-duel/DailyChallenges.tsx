import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Trophy, Clock, Zap, Star, Medal, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const DailyChallenges = () => {
  const queryClient = useQueryClient();
  const [simulating, setSimulating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["brain-duel-daily-challenge"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("brain-duel-daily-challenge", {
        body: { action: "get-today" },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const submitEntry = useMutation({
    mutationFn: async () => {
      if (!data?.challenge) throw new Error("No challenge");
      // Simulate a quiz result (in production this would be actual quiz answers)
      const score = Math.floor(Math.random() * (data.challenge.question_count + 1));
      const timeTaken = Math.floor(Math.random() * data.challenge.time_limit);

      const { data: result, error } = await supabase.functions.invoke("brain-duel-daily-challenge", {
        body: {
          action: "submit",
          challengeId: data.challenge.id,
          score,
          timeTaken,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return { score, timeTaken, reward: result.reward };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["brain-duel-daily-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["brain-duel-credits"] });
      toast.success(`Challenge completed! Score: ${result.score}`, {
        description: result.score >= 3 ? `You earned ${result.reward} credits! 🎉` : "Try harder tomorrow!",
      });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to submit");
    },
  });

  const challenge = data?.challenge;
  const leaderboard = data?.leaderboard || [];
  const userEntry = data?.userEntry;

  return (
    <>
      <FloatingHowItWorks title={"Daily Challenges - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Challenges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Challenges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 backdrop-blur-xl bg-card/80 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-primary/5 to-emerald-500/5" />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Calendar className="h-5 w-5 text-amber-400" />
          </div>
          Daily Challenge
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
        </CardTitle>
        <CardDescription>Complete today's challenge and climb the leaderboard!</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : challenge ? (
          <>
            {/* Challenge Info */}
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
              <h3 className="font-bold text-base mb-1">{challenge.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400" /> {challenge.question_count} questions</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-400" /> {challenge.time_limit}s limit</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-emerald-400" /> {challenge.reward_credits} credits</span>
              </div>
            </div>

            {/* Action Button */}
            {userEntry ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Completed!</p>
                  <p className="text-[10px] text-muted-foreground">
                    Score: {userEntry.score}/{challenge.question_count} • Time: {userEntry.time_taken}s
                  </p>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => submitEntry.mutate()}
                disabled={submitEntry.isPending}
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
              >
                {submitEntry.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Start Challenge</>
                )}
              </Button>
            )}

            {/* Leaderboard */}
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Today's Leaderboard
              </h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {leaderboard.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No entries yet. Be the first!
                    </p>
                  ) : (
                    leaderboard.map((entry: any, i: number) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" :
                          i === 1 ? "bg-gray-400/10 border border-gray-400/20" :
                          i === 2 ? "bg-amber-700/10 border border-amber-700/20" :
                          "bg-card/40"
                        }`}
                      >
                        <span className="text-sm font-black w-6 text-center">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                        </span>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/10">
                            {entry.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {entry.profile?.full_name || "Anonymous"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-primary">{entry.score}/{challenge.question_count}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.time_taken}s</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No challenge available today</p>
        )}
      </CardContent>
    </Card>
    </>
  );
};
