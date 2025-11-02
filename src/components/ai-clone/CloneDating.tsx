import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Sparkles, Bot } from "lucide-react";

export function CloneDating() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const startDatingSession = async () => {
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use Clone Dating",
          variant: "destructive"
        });
        return;
      }

      // Get user's clones
      const { data: userClones } = await supabase
        .from('personality_clones')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!userClones || userClones.length === 0) {
        toast({
          title: "No Active Clone",
          description: "You need an active clone to use Clone Dating",
          variant: "destructive"
        });
        return;
      }

      // Find a random compatible clone
      const { data: otherClones } = await supabase
        .from('personality_clones')
        .select('id')
        .neq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!otherClones || otherClones.length === 0) {
        toast({
          title: "No Matches Available",
          description: "There are no other active clones available right now",
        });
        return;
      }

      // Create dating session
      const { error } = await supabase
        .from('clone_dating_sessions')
        .insert({
          clone_1_id: userClones[0].id,
          clone_2_id: otherClones[0].id,
          payment_amount: 4.99,
          status: 'active',
          session_data: { started_at: new Date().toISOString() }
        });

      if (error) throw error;

      toast({
        title: "Dating Session Started! 💕",
        description: "Your clone is now chatting with a match (€4.99 charged)",
      });
    } catch (error) {
      console.error('Error starting dating session:', error);
      toast({
        title: "Error",
        description: "Failed to start dating session",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            Clone-to-Clone Speed Dating
          </CardTitle>
          <CardDescription>
            Let your AI clone meet and chat with other clones to build connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <Bot className="h-16 w-16 text-primary animate-pulse" />
              <Heart className="h-12 w-12 text-pink-500 mt-2" />
              <Bot className="h-16 w-16 text-purple-500 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Auto Conversations</h3>
                  <p className="text-sm text-muted-foreground">Clones chat automatically</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-pink-500" />
                  <h3 className="font-semibold mb-1">Compatibility Score</h3>
                  <p className="text-sm text-muted-foreground">AI-generated match rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold mb-1">New Connections</h3>
                  <p className="text-sm text-muted-foreground">Expand your network</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={startDatingSession}
              disabled={isSearching}
              size="lg"
              className="w-full max-w-md"
            >
              {isSearching ? (
                "Finding a match..."
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Start Dating Session (€4.99)
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground">
              Your clone will have a 10-minute speed dating session with another compatible clone
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Clone Dating Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
            <p className="text-sm">Your AI clone is matched with another compatible clone</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
            <p className="text-sm">They have an automatic conversation for 10 minutes</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
            <p className="text-sm">AI analyzes compatibility and generates a match score</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
            <p className="text-sm">Review the conversation and decide if you want to connect</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}