import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { spendDatingCredits } from "@/lib/datingAiCredits";

interface Props { onBack: () => void; }

export const AICompatibility = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ yourBio: "", theirBio: "", yourInterests: "", theirInterests: "" });

  const analyze = async () => {
    if (!form.yourBio || !form.theirBio) { toast({ title: "Fill in both bios", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await spendDatingCredits(3, "ai_compatibility");


      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Analyze the compatibility between two dating profiles. 

Person A bio: "${form.yourBio}"
Person A interests: ${form.yourInterests || "not specified"}

Person B bio: "${form.theirBio}"  
Person B interests: ${form.theirInterests || "not specified"}

Provide:
1. **Overall Compatibility Score** (0-100%)
2. **Strengths** - What makes them compatible (3-4 points)
3. **Potential Challenges** - Areas to be mindful of (2-3 points)
4. **Conversation Starters** - 3 topics they'd both enjoy discussing
5. **Date Ideas** - 3 perfect date ideas based on shared interests
6. **Long-term Potential** - Brief assessment

Be encouraging but honest. Use emojis sparingly.`
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
            <Heart className="w-6 h-6 text-primary" />
            AI Compatibility Analyzer
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary">Your Profile</h3>
              <Textarea placeholder="Your bio / about me..." value={form.yourBio} onChange={e => setForm({...form, yourBio: e.target.value})} className="min-h-20" />
              <Input placeholder="Your interests (comma-separated)" value={form.yourInterests} onChange={e => setForm({...form, yourInterests: e.target.value})} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-accent">Their Profile</h3>
              <Textarea placeholder="Their bio / about me..." value={form.theirBio} onChange={e => setForm({...form, theirBio: e.target.value})} className="min-h-20" />
              <Input placeholder="Their interests (comma-separated)" value={form.theirInterests} onChange={e => setForm({...form, theirInterests: e.target.value})} />
            </div>
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Analyzing..." : "Analyze Compatibility"}
          </Button>
          {result && (
            <Card className="bg-card/50">
              <CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
