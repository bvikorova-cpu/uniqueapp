import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2, Sparkles, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { spendDatingCredits } from "@/lib/datingAiCredits";

interface Props { onBack: () => void; }

export const AIProfileOptimizer = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ currentBio: "", personality: "balanced", goal: "relationship" });

  const optimize = async () => {
    if (!form.currentBio) { toast({ title: "Paste your current bio", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await spendDatingCredits(3, "ai_profile_optimizer");


      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are a dating profile expert. Optimize this dating bio to get more matches.

Current bio: "${form.currentBio}"
Personality style: ${form.personality}
Dating goal: ${form.goal}

Provide:
1. **Score** - Rate the current bio (1-10) with brief explanation
2. **Optimized Bio** - A rewritten, improved version (keep authentic voice)
3. **Alternative Version** - A second option with different approach
4. **Photo Tips** - 5 specific tips for better profile photos
5. **Common Mistakes** - What to avoid in dating bios
6. **Red Flags Removed** - Any red flags in the current bio

Keep the optimized bios under 300 characters each. Make them sound genuine, not AI-generated.`
        }
      });
      if (error) throw error;
      setResult(data.message || data.text);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            AI Profile Optimizer
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Paste your current dating bio here..." value={form.currentBio} onChange={e => setForm({...form, currentBio: e.target.value})} className="min-h-28" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Personality Style</label>
              <Select value={form.personality} onValueChange={v => setForm({...form, personality: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="funny">Funny & Witty</SelectItem>
                  <SelectItem value="balanced">Balanced & Genuine</SelectItem>
                  <SelectItem value="adventurous">Adventurous & Bold</SelectItem>
                  <SelectItem value="intellectual">Intellectual & Deep</SelectItem>
                  <SelectItem value="romantic">Romantic & Warm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Looking For</label>
              <Select value={form.goal} onValueChange={v => setForm({...form, goal: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relationship">Serious Relationship</SelectItem>
                  <SelectItem value="casual">Casual Dating</SelectItem>
                  <SelectItem value="friendship">Friendship First</SelectItem>
                  <SelectItem value="open">Open to Anything</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={optimize} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Optimizing..." : "Optimize My Profile"}
          </Button>
          {result && (
            <Card className="bg-card/50">
              <CardContent className="pt-4 whitespace-pre-wrap text-sm">
                {result}
                <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => { navigator.clipboard.writeText(result); toast({ title: "Copied!" }); }}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy All
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
