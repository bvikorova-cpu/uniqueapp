import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { trackIQEvent } from "@/lib/iqAnalytics";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQDailyChallenge() {
  const qc = useQueryClient();
  const [picked, setPicked] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["iq-daily-challenge"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_today_iq_challenge");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const submit = useMutation({
    mutationFn: async (idx: number) => {
      const { data: res, error } = await supabase.rpc("submit_iq_daily", {
        _challenge_id: data!.id,
        _answer_index: idx,
      } as any);
      if (error) throw error;
      return res?.[0];
    },
    onSuccess: (res: any) => {
      toast({
        title: res?.is_correct ? "🎉 Correct!" : "Not this time",
        description: res?.message,
      });
      trackIQEvent("iq_daily_submit", { correct: res?.is_correct, reward: res?.reward });
      qc.invalidateQueries({ queryKey: ["iq-daily-challenge"] });
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How IQDaily Challenge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardContent className="p-6 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent>
      </Card>
      </>
      );
  }

  if (!data) {
    return (
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Daily Challenge</CardTitle>
          <CardDescription>No challenge today — check back tomorrow.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const options = Array.isArray(data.options) ? data.options : [];
  const done = data.already_attempted;

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Daily Challenge
          <Badge className="ml-auto bg-gradient-to-r from-primary to-accent border-0">
            <Sparkles className="h-3 w-3 mr-1" /> +{data.reward_credits} credits
          </Badge>
        </CardTitle>
        <CardDescription>{data.difficulty?.toUpperCase()} · One per day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-semibold">{data.question}</p>
        <div className="grid gap-2">
          {options.map((opt: string, i: number) => (
            <Button
              key={i}
              variant={picked === i ? "default" : "outline"}
              disabled={done || submit.isPending}
              onClick={() => setPicked(i)}
              className="justify-start text-left h-auto py-2"
            >
              {opt}
            </Button>
          ))}
        </div>
        {done ? (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${data.was_correct ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {data.was_correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">
              {data.was_correct ? "You solved today's challenge!" : "Better luck tomorrow!"}
            </span>
          </div>
        ) : (
          <Button
            onClick={() => picked !== null && submit.mutate(picked)}
            disabled={picked === null || submit.isPending}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Answer"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
