import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, Award, ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function EmotionMining({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);

  const startMining = async () => {
    setIsMining(true);
    setMiningProgress(0);

    const interval = setInterval(() => {
      setMiningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeMining();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const completeMining = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("emotion-mine", {
        body: { emotion_type: "joy", mining_method: "content_creation" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const amount = (data as any)?.amount_mined ?? 0;
      const commission = (data as any)?.commission_earned ?? 0;

      toast({
        title: "Mining Complete! ⚡",
        description: `You mined ${amount} emotions and earned €${Number(commission).toFixed(2)} commission`,
      });
    } catch (error: any) {
      console.error("Error completing mining:", error);
      toast({
        title: "Mining failed",
        description: error?.message || "Try again in a moment",
        variant: "destructive",
      });
    } finally {
      setIsMining(false);
      setMiningProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Mining"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      )}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-500" />
            Emotion Mining
          </CardTitle>
          <CardDescription>
            Create emotions for others and earn 50% commission on each transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-500/10 border-4 border-green-500/20">
              <Zap className="h-16 w-16 text-green-500" />
            </div>
            
            {isMining ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">Mining in progress...</p>
                <Progress value={miningProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">{miningProgress}% complete</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg font-semibold">Start Mining Emotions</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Create positive emotions through content, interactions, and engagement. 
                  Earn 50% commission when others consume your emotions.
                </p>
                <Button onClick={startMining} size="lg" className="mt-4">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Mining
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Active Miners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">mining emotions now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Miner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">@emotionking</p>
            <p className="text-sm text-muted-foreground">€524.50 earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€0.00</p>
            <p className="text-sm text-muted-foreground">total commission</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Mining Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
              <p className="text-sm">Create positive, engaging content that generates emotions</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
              <p className="text-sm">AI detects and quantifies the emotional value</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
              <p className="text-sm">Other users consume your emotions by interacting with your content</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
              <p className="text-sm">You earn 50% commission on every emotion transaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}