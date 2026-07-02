import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Calendar, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Confession {
  id: string;
  confession_text: string;
  sin_category: string;
  severity_score: number;
  absolution_votes: number;
  condemnation_votes: number;
  created_at: string;
  is_anonymous: boolean;
}

export const ConfessionWall = () => {
  const { toast } = useToast();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokensRemaining, setTokensRemaining] = useState(0);

  useEffect(() => {
    loadConfessions();
    checkTokens();
  }, []);

  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-confessions", {
        body: { limit: 20, offset: 0 },
      });
      if (error) throw error;
      setConfessions(data.confessions || []);
    } catch (error) {
      console.error("Error loading confessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("absolution_tokens")
        .select("tokens_remaining")
        .eq("user_id", user.id)
        .single();

      setTokensRemaining(data?.tokens_remaining || 0);
    } catch (error) {
      console.error("Error checking tokens:", error);
    }
  };

  const handleVote = async (confessionId: string, voteType: "absolve" | "condemn") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("vote-absolution", {
        body: { confessionId, voteType },
      });

      if (error) throw error;

      setTokensRemaining(data.tokensRemaining);
      await loadConfessions();
      toast({ title: `Vote cast: ${voteType}` });
    } catch (error: any) {
      toast({ title: "Failed to vote", description: error.message, variant: "destructive" });
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 8) return "destructive";
    if (score >= 5) return "default";
    return "secondary";
  };

  return (
    <>
      <FloatingHowItWorks
        title='Confession Wall'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Confession Wall panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-foreground">Community Confessions</h3>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {tokensRemaining} Tokens
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading confessions...</div>
      ) : (
        <div className="grid gap-4">
          {confessions.map((confession) => (
            <Card key={confession.id} className="border-border/50 bg-card">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-foreground mb-2">
                      {confession.confession_text}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={getSeverityColor(confession.severity_score)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {confession.sin_category}
                      </Badge>
                      <Badge variant="outline">
                        Severity: {confession.severity_score}/10
                      </Badge>
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(confession.id, "absolve")}
                    disabled={tokensRemaining === 0}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Absolve ({confession.absolution_votes})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(confession.id, "condemn")}
                    disabled={tokensRemaining === 0}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Condemn ({confession.condemnation_votes})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};