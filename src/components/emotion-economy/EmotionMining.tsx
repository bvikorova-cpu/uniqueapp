import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, Award } from "lucide-react";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const emotionsMined = Math.floor(Math.random() * 20) + 10;
      const commission = emotionsMined * 0.5;

      const { error } = await supabase
        .from('emotion_mining_activities')
        .insert({
          miner_id: user.id,
          emotion_type: 'joy',
          amount_mined: emotionsMined,
          commission_earned: commission,
          mining_method: 'content_creation'
        });

      if (error) throw error;

      toast({
        title: "Mining Complete! ⚡",
        description: `You mined ${emotionsMined} emotions and earned €${commission.toFixed(2)} commission`
      });
    } catch (error) {
      console.error('Error completing mining:', error);
    } finally {
      setIsMining(false);
      setMiningProgress(0);
    }
  };

  return (
    <div className="space-y-6">
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