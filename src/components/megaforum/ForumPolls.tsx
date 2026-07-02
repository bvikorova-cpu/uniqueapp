import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Plus, Vote, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ForumPollsProps {
  onBack: () => void;
}

export const ForumPolls = ({ onBack }: ForumPollsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["forum-polls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_polls")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["forum-poll-votes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("forum_poll_votes")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: allVotes = [] } = useQuery({
    queryKey: ["forum-all-poll-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_poll_votes").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createPoll = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) throw new Error("At least 2 options required");

      const { error } = await supabase.from("forum_polls").insert({
        user_id: user.id,
        post_id: null as any, // standalone poll
        question,
        options: validOptions.map(o => ({ text: o, votes: 0 })),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-polls"] });
      setShowCreate(false);
      setQuestion("");
      setOptions(["", "", ""]);
      toast({ title: "Poll created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");

      const { error } = await supabase.from("forum_poll_votes").insert({
        poll_id: pollId,
        user_id: user.id,
        option_index: optionIndex,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-poll-votes"] });
      queryClient.invalidateQueries({ queryKey: ["forum-all-poll-votes"] });
      toast({ title: "Vote recorded!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const hasVoted = (pollId: string) => myVotes.some((v: any) => v.poll_id === pollId);

  const getVoteCounts = (pollId: string, optionsCount: number) => {
    const pollVotes = allVotes.filter((v: any) => v.poll_id === pollId);
    const counts = Array(optionsCount).fill(0);
    pollVotes.forEach((v: any) => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });
    return { counts, total: pollVotes.length };
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Forum Polls"}
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
          <Plus className="h-4 w-4" /> Create Poll
        </Button>
      </div>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        📊 Polls & Surveys
      </h2>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader><CardTitle>Create New Poll</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              {options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                />
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOptions([...options, ""])}>
                  + Add Option
                </Button>
                <Button onClick={() => createPoll.mutate()} disabled={!question.trim() || createPoll.isPending}>
                  {createPoll.isPending ? "Creating..." : "Publish Poll"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-center py-10">Loading polls...</p>
      ) : polls.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-xl">
          <CardContent className="text-center py-10 text-muted-foreground">
            No polls yet. Be the first to create one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll: any, idx: number) => {
            const pollOptions = (poll.options as any[]) || [];
            const voted = hasVoted(poll.id);
            const { counts, total } = getVoteCounts(poll.id, pollOptions.length);

            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-card/80 backdrop-blur-xl hover:shadow-lg transition-all border-primary/10">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg">{poll.question}</h3>
                      <Badge variant="secondary">{total} votes</Badge>
                    </div>

                    <div className="space-y-2">
                      {pollOptions.map((opt: any, i: number) => {
                        const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
                        const myVote = myVotes.find((v: any) => v.poll_id === poll.id);

                        return (
                          <button
                            key={i}
                            onClick={() => !voted && voteMutation.mutate({ pollId: poll.id, optionIndex: i })}
                            disabled={voted || voteMutation.isPending}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium flex items-center gap-1">
                                {myVote?.option_index === i && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                {opt.text || opt}
                              </span>
                              {voted && <span className="text-xs text-muted-foreground">{pct}%</span>}
                            </div>
                            {voted && <Progress value={pct} className="h-2" />}
                            {!voted && (
                              <div className="h-8 rounded-md border border-border/50 flex items-center px-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors">
                                {opt.text || opt}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
