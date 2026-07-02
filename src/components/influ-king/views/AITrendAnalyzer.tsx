import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Loader2, Sparkles, BarChart3, Hash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export default function AITrendAnalyzer({ onBack }: Props) {
  const [platform, setPlatform] = useState("Instagram");
  const [niche, setNiche] = useState("Fashion & Beauty");
  const [trends, setTrends] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("influ-king-ai", {
        body: { action: "trend-analysis", platform, niche },
      });
      if (error) throw error;
      setTrends(data);
      toast.success("Trend analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze trends");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How AI Trend Analyzer works"
        steps={[
          { title: 'Choose platform & niche', desc: 'IG, TikTok, YouTube, X.' },
          { title: 'Analyze (5 credits)', desc: 'AI pulls trending topics and hashtags.' },
          { title: 'Review insights', desc: 'Get topics, hashtags, recommendations.' },
          { title: 'Act on it', desc: 'Use insights to plan next content batch.' },
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="h-8 w-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">AI Trend Analyzer</h2>
          <p className="text-muted-foreground">Real-time trend insights and content recommendations</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-cyan-500/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Instagram", "TikTok", "YouTube", "Twitter/X"].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Niche</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Fashion & Beauty", "Fitness & Wellness", "Technology & Gaming", "Food & Cooking", "Travel & Adventure", "Business & Finance"].map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
          Analyze Trends (5 credits)
        </Button>
      </Card>

      {trends && (
        <div className="space-y-4">
          {trends.trending_topics && (
            <Card className="p-4 border-cyan-500/10">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-cyan-400" /> Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {trends.trending_topics.map((topic: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">{topic}</span>
                ))}
              </div>
            </Card>
          )}
          {trends.hashtags && (
            <Card className="p-4 border-cyan-500/10">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Hash className="h-4 w-4 text-purple-400" /> Top Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {trends.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">#{tag}</span>
                ))}
              </div>
            </Card>
          )}
          {trends.recommendations && (
            <Card className="p-4 border-cyan-500/10">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /> Recommendations</h3>
              <div className="space-y-2">
                {trends.recommendations.map((rec: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">• {rec}</p>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
    </>
  );
}
