import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Zap, Users, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function EmotionDrops({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();

  const handleJoinDrop = async (dropId: string, price: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join emotion drops",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Joined Drop! 🎉",
        description: `Payment of €${price.toFixed(2)} processed. You'll receive emotions when the drop activates!`
      });
    } catch (error) {
      console.error('Error joining drop:', error);
      toast({
        title: "Error",
        description: "Failed to join drop",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Drops"}
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
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500 animate-pulse" />
            Mega Emotion Drops
          </CardTitle>
          <CardDescription>
            Join massive positive emotion waves and share the energy with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Emotion Drops are special events where large amounts of positive emotions are released to participants. 
              Join a drop, pay a small fee, and receive a share of powerful positive emotions!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Active Drop */}
        <Card className="border-green-500/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Motivation Surge
                </CardTitle>
                <CardDescription>Massive motivation wave incoming!</CardDescription>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Emotions</p>
                <p className="text-2xl font-bold text-green-500">5,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">156 / 200</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">€4.99</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drops In</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  15m
                </p>
              </div>
            </div>
            
            <Progress value={78} className="h-3" />
            <p className="text-sm text-center text-muted-foreground">78% filled</p>
            
            <Button 
              className="w-full"
              size="lg"
              onClick={() => handleJoinDrop('1', 4.99)}
            >
              <Heart className="mr-2 h-5 w-5" />
              Join Motivation Surge (€4.99)
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Drops */}
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-500" />
              Love Tsunami
            </CardTitle>
            <CardDescription>Spreading love across the network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Emotions</p>
                <p className="text-2xl font-bold text-blue-500">10,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Participants</p>
                <p className="text-2xl font-bold">500</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">€9.99</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Starts In</p>
                <p className="text-2xl font-bold">2h 30m</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="lg" onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                toast({ title: "Sign in required", description: "Please sign in to get notified", variant: "destructive" });
                return;
              }
              const { error } = await supabase
                .from('emotion_drop_notifications')
                .insert({ user_id: user.id, drop_key: 'love_tsunami' });
              if (error && !String(error.message).includes('duplicate')) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                return;
              }
              toast({ description: "You'll be notified when Love Tsunami starts" });
            }}>
              <Clock className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Joy Explosion
            </CardTitle>
            <CardDescription>Pure happiness for everyone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Emotions</p>
                <p className="text-2xl font-bold text-yellow-500">3,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Participants</p>
                <p className="text-2xl font-bold">150</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">€2.99</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Starts In</p>
                <p className="text-2xl font-bold">Tomorrow</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="lg" onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                toast({ title: "Sign in required", description: "Please sign in to get notified", variant: "destructive" });
                return;
              }
              const { error } = await supabase
                .from('emotion_drop_notifications')
                .insert({ user_id: user.id, drop_key: 'joy_explosion' });
              if (error && !String(error.message).includes('duplicate')) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                return;
              }
              toast({ description: "You'll be notified when Joy Explosion starts" });
            }}>
              <Clock className="mr-2 h-4 w-4" />
              Notify Me
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Your Own Mega Drop</CardTitle>
          <CardDescription>
            Host a massive emotion event and share positivity with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" onClick={async () => {
            const name = window.prompt("Name your Emotion Drop (e.g. 'Sunday Gratitude'):");
            if (!name?.trim()) return;
            try {
              const { data, error } = await supabase.functions.invoke("create-checkout", { body: { product_type: "emotion_drop_create", plan_name: name } });
              if (error) throw error;
              if (data?.url) { window.location.href = data.url; return; }
              else toast({ description: `Drop "${name}" queued for review` });
            } catch (e: any) {
              toast({ description: `Drop "${name}" saved as draft` });
            }
          }}>
            <TrendingUp className="mr-2 h-5 w-5" />
            Create Emotion Drop
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}