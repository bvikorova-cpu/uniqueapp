import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props { profile: any; onApply?: (bio: string) => void; }

interface Result {
  score: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  rewrites: { label: string; text: string }[];
}

export const AIBioCoach = ({ profile, onApply }: Props) => {
  const { toast } = useToast();
  const [bio, setBio] = useState<string>(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const analyze = async () => {
    if (!bio.trim()) { toast({ title: "Enter your bio", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dating-ai-coach", {
        body: { action: "bio_coach", bio, profile },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      toast({ title: "Coach failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: "Copied" }); };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" /> AI Bio Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Your current bio..." className="min-h-24" maxLength={500} />
        <Button onClick={analyze} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? "Analyzing..." : "Analyze & suggest"}
        </Button>

        {result && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm"><span>Bio score</span><span className="font-semibold">{result.score}/100</span></div>
              <Progress value={result.score} />
            </div>

            {result.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1"><ThumbsUp className="w-3 h-3" /> Strengths</p>
                <ul className="text-sm space-y-1 list-disc pl-5">{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.weaknesses?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3" /> Weaknesses</p>
                <ul className="text-sm space-y-1 list-disc pl-5">{result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.tips?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1"><Lightbulb className="w-3 h-3" /> Tips for your profile type</p>
                <ul className="text-sm space-y-1 list-disc pl-5">{result.tips.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.rewrites?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Rewrites</p>
                {result.rewrites.map((r, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-3 space-y-2">
                      <Badge variant="secondary">{r.label}</Badge>
                      <p className="text-sm whitespace-pre-wrap">{r.text}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copy(r.text)} className="gap-1"><Copy className="w-3 h-3" />Copy</Button>
                        {onApply && <Button size="sm" onClick={() => onApply(r.text)}>Use this</Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
