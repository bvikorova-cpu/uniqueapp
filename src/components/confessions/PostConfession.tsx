import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PostConfessionProps {
  onConfessionPosted?: () => void;
}

export const PostConfession = ({ onConfessionPosted }: PostConfessionProps) => {
  const { toast } = useToast();
  const [confessionText, setConfessionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!confessionText.trim()) {
      toast({ title: "Please write your confession", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("post-confession", {
        body: { confessionText, isAnonymous },
      });

      if (error) throw error;

      toast({
        title: "Confession Posted!",
        description: `Category: ${data.confession.category} | Severity: ${data.confession.severity}/10`,
      });

      setConfessionText("");
      onConfessionPosted?.();
    } catch (error: any) {
      toast({
        title: "Failed to post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Post Confession'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Post Confession panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Share Your Confession</CardTitle>
        <CardDescription className="text-muted-foreground">
          Unburden your soul anonymously. AI will categorize and assess your confession.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="confession" className="text-foreground">Your Confession</Label>
          <Textarea
            id="confession"
            placeholder="I confess that..."
            value={confessionText}
            onChange={(e) => setConfessionText(e.target.value)}
            rows={6}
            className="mt-2 bg-background text-foreground"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
          <div>
            <Label htmlFor="anonymous" className="text-foreground font-medium">
              Post Anonymously
            </Label>
            <p className="text-sm text-muted-foreground">
              Your identity will be hidden from the community
            </p>
          </div>
          <Switch
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !confessionText.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Post Confession
            </>
          )}
        </Button>
      </CardContent>
    </Card>
    </>
  );
};