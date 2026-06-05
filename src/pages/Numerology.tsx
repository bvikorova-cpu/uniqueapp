import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Sparkles, Calendar, Heart, Briefcase, Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TOOLS = [
  { icon: Hash, title: "Life Path Number", desc: "Your core purpose from date of birth", cost: 3 },
  { icon: Heart, title: "Love Compatibility", desc: "Numerological match between two names", cost: 5 },
  { icon: Briefcase, title: "Career Number", desc: "Best career paths based on your numbers", cost: 4 },
  { icon: Calendar, title: "Personal Year Forecast", desc: "What 2026 holds for you", cost: 4 },
  { icon: Star, title: "Name Energy", desc: "What your full name vibrates", cost: 3 },
  { icon: Sparkles, title: "Lucky Numbers", desc: "Your personal lucky number set", cost: 3 },
];

export default function Numerology() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async (tool: string, cost: number) => {
    if (!user) {
      toast.error("Please sign in first");
      window.location.href = "/auth?redirect=/numerology";
      return;
    }
    if (!name || !dob) {
      toast.error("Enter full name and date of birth");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-text-generator", {
        body: {
          system: "You are an expert numerologist. Give a concise mystical, encouraging reading in 4-6 sentences.",
          prompt: `Numerology reading: "${tool}" for ${name}, born ${dob}.`,
          credits: cost,
          feature: `numerology-${tool.toLowerCase().replace(/\s+/g, "-")}`,
        },
      });
      if (error) throw error;
      setResult(data?.text ?? data?.result ?? "No reading produced.");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate reading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Sparkles className="w-4 h-4" /> Numerology Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Decode the numbers that shape your life</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered numerology readings — life path, compatibility, career, and personal year forecasts. From 3 credits per reading.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>Used by every tool below — saved only for this session.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {TOOLS.map((t) => (
            <Card key={t.title} className="hover:border-primary/50 transition">
              <CardHeader>
                <t.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => run(t.title, t.cost)} disabled={loading} className="w-full">
                  Generate · {t.cost} credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Card>
            <CardHeader><CardTitle>Your reading</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap leading-relaxed">{result}</p></CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
