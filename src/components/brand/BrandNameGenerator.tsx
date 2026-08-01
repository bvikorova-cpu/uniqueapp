import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Globe, Copy, Check, ArrowLeft, History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrandNameGeneratorProps {
  credits: number;
  onBack: () => void;
  onCreditsUsed: () => void;
}

const BrandNameGenerator = ({ credits, onBack, onCreditsUsed }: BrandNameGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("brand_name_suggestions")
      .select("id, industry, style, keywords, suggestions, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data ?? []);
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("brand_name_suggestions").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  const handleGenerate = async () => {
    if (!industry || !style) {
      toast({ title: "Missing Info", description: "Please fill in industry and style.", variant: "destructive" });
      return;
    }
    if (credits < 8) {
      toast({ title: "Insufficient Credits", description: "You need 8 credits.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in first");

      const prompt = `Generate exactly 10 creative, memorable brand names.
Industry: ${industry}
Style: ${style}
Keywords / values: ${keywords || "none"}

Return ONLY valid JSON: {"names":[{"name":"","meaning":"","domain_suggestion":"","tagline":""}]}`;

      const res = await supabase.functions.invoke("forge-ai-tools", {
        body: { action: "cowriter", text: prompt, extra: { category: "brand_names", history: [{ role: "user", content: prompt }] } } });

      if (res.error) throw res.error;
      if (res.data?.error === "INSUFFICIENT_CREDITS") throw new Error("Insufficient credits");
      if (res.data?.error) throw new Error(res.data.error);

      const raw = String(res.data?.content ?? "");
      let names: any[] = [];
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        const parsed = match ? JSON.parse(match[0]) : null;
        names = Array.isArray(parsed?.names) ? parsed.names.slice(0, 10) : [];
      } catch { names = []; }
      if (names.length === 0) throw new Error("AI could not generate names right now. Please try again.");

      // Charge the remainder so the total matches the advertised 8 credits (cowriter charges 2)
      await supabase.rpc("deduct_ai_credits_atomic", { _user_id: user.id, _amount: 6 });

      const { error: saveError } = await supabase.from("brand_name_suggestions").insert({
        user_id: user.id,
        industry,
        style,
        keywords: keywords || null,
        suggestions: names,
        credits_used: 8 });

      setResults(names);
      onCreditsUsed();
      void loadHistory();
      toast({
        title: "✨ Names Generated!",
        description: saveError
          ? "Names are ready, but saving to your history failed."
          : "10 names ready and saved to your history below." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyName = (name: string, idx: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Brand Name Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Name Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Name Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">AI Brand Name Generator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Find Your Perfect Brand Name</h2>
        <p className="text-muted-foreground mt-2">AI generates 10 creative, memorable names tailored to your industry</p>
        <Badge variant="secondary" className="mt-2">Cost: 8 credits | Your Credits: {credits}</Badge>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Name Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Input placeholder="e.g., Technology, Fashion, Food" value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Brand Style *</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Minimal</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                    <SelectItem value="luxury">Luxury & Premium</SelectItem>
                    <SelectItem value="tech">Tech & Futuristic</SelectItem>
                    <SelectItem value="organic">Organic & Natural</SelectItem>
                    <SelectItem value="bold">Bold & Disruptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Keywords / Values</Label>
              <Input placeholder="e.g., innovation, trust, speed, sustainability" value={keywords} onChange={e => setKeywords(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={loading || !industry || !style} className="w-full" size="lg">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Names...</> : <><Sparkles className="mr-2 h-5 w-5" /> Generate 10 Brand Names (8 Credits)</>}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-shadow border-primary/10 hover:border-primary/30">
                <CardContent className="pt-5 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyName(item.name, i)}>
                      {copiedIdx === i ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.meaning}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{item.domain_suggestion}</span>
                  </div>
                  <p className="text-xs italic text-primary/80">"{item.tagline}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Saved name sets</h3>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
          {history.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold capitalize truncate">{entry.industry} · {entry.style}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                      {entry.keywords ? ` · ${entry.keywords}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setResults(entry.suggestions ?? [])}>
                      Load
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(entry.suggestions ?? []).slice(0, 10).map((n: any, i: number) => (
                    <Badge key={i} variant="outline">{n?.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
    </>
  );
};

export default BrandNameGenerator;
