import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, GitBranch, Atom, Infinity as InfinityIcon, Telescope, Layers } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SCENARIOS = [
  { icon: GitBranch, title: "Pivotal Decision", desc: "What if you had chosen the other path?", cost: 5 },
  { icon: Atom, title: "Career Multiverse", desc: "5 alternate careers you might be living", cost: 5 },
  { icon: Telescope, title: "Future Self in 2046", desc: "Most likely + most unexpected versions", cost: 5 },
  { icon: Layers, title: "Romantic Timelines", desc: "Parallel love-life branches", cost: 5 },
  { icon: InfinityIcon, title: "Dream Self Reality", desc: "If every dream had come true", cost: 4 },
  { icon: Sparkles, title: "Soul Mission Variant", desc: "Your higher-purpose alternate self", cost: 4 },
];

export default function ParallelUniverse() {
  const { user } = useAuth();
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async (title: string, cost: number) => {
    if (!user) {
      toast.error("Please sign in first");
      window.location.href = "/auth?redirect=/parallel-universe";
      return;
    }
    if (!seed.trim()) {
      toast.error("Describe yourself or the moment to explore");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-text-generator", {
        body: {
          prompt: `You are a speculative-fiction narrator. Write a vivid, hopeful 'parallel universe' scenario in 5-8 sentences, second person.\n\nScenario: "${title}". User context: ${seed}`,
        },
      });
      if (error) throw error;
      setResult(data?.text ?? data?.result ?? "No scenario produced.");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm mb-4">
            <InfinityIcon className="w-4 h-4" /> Parallel Universe Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Explore the lives you didn't live</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-imagined alternate timelines based on your choices, dreams, and turning points.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tell us about you</CardTitle>
            <CardDescription>A short paragraph — age, profession, biggest crossroad, dream you set aside.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="seed">Your context</Label>
            <Textarea id="seed" rows={4} value={seed} onChange={(e) => setSeed(e.target.value)}
              placeholder="I'm 32, software engineer in Bratislava. At 22 I almost moved to Tokyo to study film…" />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {SCENARIOS.map((s) => (
            <Card key={s.title} className="hover:border-accent/50 transition">
              <CardHeader>
                <s.icon className="w-8 h-8 text-accent mb-2" />
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => run(s.title, s.cost)} disabled={loading} className="w-full">
                  Imagine · {s.cost} credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Card>
            <CardHeader><CardTitle>Your parallel scenario</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap leading-relaxed">{result}</p></CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
