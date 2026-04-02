import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AILatteArtCoach = ({ onBack }: { onBack: () => void }) => {
  const [skill, setSkill] = useState("");
  const [pattern, setPattern] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCoach = async () => {
    if (!skill || !pattern.trim()) { toast.error("Select skill level and describe the pattern"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "latte_art", skill, pattern }
      });
      if (error) throw error;
      setResult(data?.result || "No coaching generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error generating coaching");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-purple-400" />AI Latte Art Coach<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger><SelectValue placeholder="Your skill level" /></SelectTrigger>
            <SelectContent>
              {["Beginner", "Intermediate", "Advanced", "Competition"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea value={pattern} onChange={e => setPattern(e.target.value)} placeholder="What pattern do you want to learn? e.g. 'Heart', 'Rosetta', 'Tulip', 'Swan'..." rows={3} />
          <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-800" onClick={handleCoach} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Coaching...</> : "Get Latte Art Coaching"}
          </Button>
          {result && <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
