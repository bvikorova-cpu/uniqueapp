import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Type, Image as ImageIcon, FileText, Download, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TOOLS = [
  { icon: Palette, title: "Color Palette", desc: "5-color brand palette with HEX + usage notes", cost: 4 },
  { icon: Type, title: "Typography Pair", desc: "Heading + body font pair from Google Fonts", cost: 3 },
  { icon: ImageIcon, title: "Logo Concepts", desc: "3 AI-generated logo directions", cost: 8 },
  { icon: FileText, title: "Brand Voice Guide", desc: "Tone, do/don't examples, sample copy", cost: 5 },
  { icon: Sparkles, title: "Tagline Set", desc: "10 taglines in different tones", cost: 3 },
  { icon: Download, title: "Full Brand PDF", desc: "Export everything as a styled PDF brand book", cost: 10 },
];

export default function BrandKits() {
  const { user } = useAuth();
  const [brandName, setBrandName] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = async (title: string, cost: number) => {
    if (!user) {
      toast.error("Please sign in first");
      window.location.href = "/auth?redirect=/brand-kits";
      return;
    }
    if (!brandName.trim() || !pitch.trim()) {
      toast.error("Enter brand name and short pitch");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-text-generator", {
        body: {
          prompt: `You are a senior brand designer. Produce concrete, usable brand deliverables. Use clear bullet lists and HEX codes where relevant.\n\nDeliverable: ${title}. Brand: "${brandName}". Pitch: ${pitch}`,
        },
      });
      if (error) throw error;
      setResult(data?.text ?? data?.result ?? "No output produced.");
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Palette className="w-4 h-4" /> Brand Kits Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Launch your brand in an hour</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-built brand assets — palette, typography, logo, voice, tagline, full brand book PDF.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your brand</CardTitle>
            <CardDescription>Used by every tool below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brand">Brand name</Label>
              <Input id="brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Lumen Coffee" />
            </div>
            <div>
              <Label htmlFor="pitch">One-sentence pitch</Label>
              <Textarea id="pitch" rows={3} value={pitch} onChange={(e) => setPitch(e.target.value)}
                placeholder="Specialty coffee subscription for remote-working millennials in Central Europe." />
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
            <CardHeader><CardTitle>Output</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap leading-relaxed font-mono text-sm">{result}</p></CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
