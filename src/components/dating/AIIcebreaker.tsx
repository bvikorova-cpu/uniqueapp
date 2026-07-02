import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Loader2, Sparkles, ArrowLeft, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { spendDatingCredits } from "@/lib/datingAiCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIIcebreaker = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", interests: "", tone: "playful", context: "first_message" });

  const generate = async () => {
    if (!form.name) { toast({ title: "Enter their name", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await spendDatingCredits(3, "ai_icebreaker");


      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Generate 5 unique and creative icebreaker messages for a dating app. The person's name is ${form.name}. Their interests include: ${form.interests || "not specified"}. Tone: ${form.tone}. Context: ${form.context === "first_message" ? "This is the very first message to them" : form.context === "after_match" ? "We just matched" : "Continuing a conversation"}. Make each message feel natural, confident, and engaging. Number each message 1-5. Keep each under 2 sentences. Don't be generic or cliché.`
        }
      });
      if (error) throw error;
      const text = data.message || data.text;
      const lines = text.split(/\d+[.)]\s*/).filter((l: string) => l.trim());
      setResults(lines.length > 1 ? lines : [text]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg.trim());
    toast({ title: "Copied!", description: "Message copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"A I Icebreaker"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            AI Icebreaker Generator
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Their name (e.g., Sarah, Alex)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input placeholder="Their interests (e.g., hiking, photography, cooking)" value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Tone</label>
              <Select value={form.tone} onValueChange={v => setForm({...form, tone: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="playful">Playful & Fun</SelectItem>
                  <SelectItem value="witty">Witty & Clever</SelectItem>
                  <SelectItem value="romantic">Romantic & Sweet</SelectItem>
                  <SelectItem value="confident">Confident & Direct</SelectItem>
                  <SelectItem value="casual">Casual & Chill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Context</label>
              <Select value={form.context} onValueChange={v => setForm({...form, context: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_message">First Message</SelectItem>
                  <SelectItem value="after_match">After Matching</SelectItem>
                  <SelectItem value="continue">Continue Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Generate Icebreakers"}
          </Button>
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((msg, i) => (
                <Card key={i} className="bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="pt-4 flex items-start gap-3">
                    <p className="text-sm flex-1">{msg.trim()}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyMessage(msg)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={generate} disabled={loading} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Generate More (3 Credits)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
