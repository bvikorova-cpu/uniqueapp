import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  challenge_type: string;
  requirement_value: number;
  bonus_votes: number;
}

interface ProgressPayload {
  challenge: Challenge | null;
  progress: number;
  completed: boolean;
}

export const MegatalentDailyChallenge = () => {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      await supabase.rpc("generate_megatalent_daily_challenge");
      const { data: userRes } = await supabase.auth.getUser();
      const { data: payload, error } = await supabase.rpc(
        "get_megatalent_challenge_progress",
        { _user_id: userRes.user?.id ?? null },
      );
      if (error) throw error;
      setData(payload as unknown as ProgressPayload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const claim = async () => {
    setClaiming(true);
    try {
      const { data: res, error } = await supabase.functions.invoke(
        "claim-megatalent-challenge",
      );
      if (error) throw error;
      if ((res as any)?.success) {
        toast({
          title: "🎉 Challenge complete!",
          description: `+${(res as any).bonus_votes} bonus votes awarded`,
        });
        await load();
      } else if ((res as any)?.already_claimed) {
        toast({ title: "Already claimed today" });
      }
    } catch (e: any) {
      toast({
        title: "Could not claim",
        description: e?.message ?? "Try again later",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !data?.challenge) {
    return null;
  }

  const { challenge, progress, completed } = data;
  const pct = Math.min((progress / challenge.requirement_value) * 100, 100);
  const ready = progress >= challenge.requirement_value && !completed;

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Daily Challenge - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Daily Challenge section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Daily Challenge.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Daily Challenge
          </div>
          {completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{challenge.title}</h4>
            <p className="text-xs text-muted-foreground">{challenge.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Sparkles className="h-3 w-3" />+{challenge.bonus_votes}
          </Badge>
        </div>

        {!completed && (
          <div className="space-y-1.5">
            <Progress value={pct} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress} / {challenge.requirement_value}</span>
              <span>{Math.round(pct)}%</span>
            </div>
          </div>
        )}

        {ready && (
          <Button onClick={claim} disabled={claiming} className="w-full" size="sm">
            {claiming ? "Claiming..." : `Claim +${challenge.bonus_votes} votes`}
          </Button>
        )}

        {completed && (
          <div className="text-center text-xs text-green-600 dark:text-green-400 font-medium">
            ✨ Bonus votes awarded for today
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentDailyChallenge;
