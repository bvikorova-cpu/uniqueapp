import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Smile, Zap, ThumbsUp, Frown, AlertTriangle, Sparkles, Cloud, Coins, ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const emotionIcons: Record<string, any> = {
  joy: Smile,
  sadness: Frown,
  motivation: Zap,
  love: Heart,
  anger: AlertTriangle,
  fear: Cloud,
  excitement: Sparkles,
  peace: ThumbsUp
};

interface Wallet {
  joy_balance: number;
  sadness_balance: number;
  motivation_balance: number;
  love_balance: number;
  anger_balance: number;
  fear_balance: number;
  excitement_balance: number;
  peace_balance: number;
  total_mined: number;
  total_traded: number;
  is_premium: boolean;
}

interface Credits {
  credits_remaining: number;
}

export function EmotionWallet({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .maybeSingle();

      setCredits({ credits_remaining: data?.credits_remaining ?? 0 });
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: walletData, error } = await supabase
        .from('emotion_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!walletData && !error) {
        const { data: newWallet, error: insertError } = await supabase
          .from('emotion_wallets')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        walletData = newWallet;
      }

      if (error) throw error;
      setWallet(walletData);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !wallet) {
    return <div className="text-center py-8">Loading your emotion wallet...</div>;
  }

  const emotions = [
    { name: 'Joy', key: 'joy_balance', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Love', key: 'love_balance', color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Motivation', key: 'motivation_balance', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Excitement', key: 'excitement_balance', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Peace', key: 'peace_balance', color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Sadness', key: 'sadness_balance', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { name: 'Anger', key: 'anger_balance', color: 'text-red-700', bg: 'bg-red-700/10' },
    { name: 'Fear', key: 'fear_balance', color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Wallet"}
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
      {/* AI Credits Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              AI Credits
            </CardTitle>
            <Badge variant="default" className="text-lg px-3 py-1">
              {credits?.credits_remaining ?? 0} credits
            </Badge>
          </div>
          <CardDescription>
            All Emotion Economy actions run on your unified AI credits — no subscription needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" asChild>
            <a href="/ai-credits">Top up AI credits</a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Emotion Wallet</CardTitle>
              <CardDescription>Manage your emotional currency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emotions.map((emotion) => {
              const Icon = emotionIcons[emotion.key.replace('_balance', '')];
              const balance = wallet[emotion.key as keyof Wallet] as number;
              
              return (
                <Card key={emotion.key} className={emotion.bg}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${emotion.color}`} />
                      <span className={`text-xl font-bold ${emotion.color}`}>{balance}</span>
                    </div>
                    <p className="text-sm font-medium mb-2">{emotion.name}</p>
                    <Progress value={Math.min((balance / 100) * 100, 100)} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Mined</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{wallet.total_mined}</p>
            <p className="text-sm text-muted-foreground">emotions created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Traded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{wallet.total_traded}</p>
            <p className="text-sm text-muted-foreground">transactions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{credits?.credits_remaining ?? 0}</p>
            <p className="text-sm text-muted-foreground">available for Emotion Economy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}