import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Palette as PaletteIcon, Loader2, Copy } from "lucide-react";

type Kit = {
  brandName?: string; tagline?: string;
  palette?: { name: string; hex: string }[];
  typography?: { heading?: string; body?: string; rationale?: string };
  logoConcept?: string; moodKeywords?: string[];
  doList?: string[]; dontList?: string[];
};

export function GraphicDesignAI() {
  const { toast } = useToast();
  const [brief, setBrief] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<Kit | null>(null);

  const generate = async () => {
    setLoading(true);
    setKit(null);
    try {
      const { data, error } = await supabase.functions.invoke("graphic-design-ai", {
        body: { brief, industry: industry || "general", style: style || "modern" },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setKit((data as { kit: Kit }).kit);
      toast({ title: "Brand kit ready", description: "3 AI credits used." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast({ title: "Copied", description: hex });
  };

  return (
    <Card className="p-4 sm:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-2xl font-black">AI Brand Kit Generator</h2>
        <Badge variant="secondary" className="ml-auto">3 credits</Badge>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        Get a complete starter brand kit — palette, typography, logo concept, tagline, and do/don't rules.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <Input placeholder="Industry (e.g. specialty coffee)" value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={40} />
        <Input placeholder="Style (e.g. minimal, playful, luxury)" value={style} onChange={(e) => setStyle(e.target.value)} maxLength={40} />
      </div>
      <Textarea
        placeholder="Describe your brand (optional)…"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        maxLength={500}
        rows={3}
        className="mb-3"
      />
      <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><PaletteIcon className="w-4 h-4 mr-2" />Generate brand kit</>}
      </Button>

      {kit && (
        <div className="mt-6 space-y-5 text-sm">
          <div>
            <h3 className="text-2xl font-black">{kit.brandName || "Untitled brand"}</h3>
            {kit.tagline && <p className="italic text-muted-foreground">"{kit.tagline}"</p>}
            {kit.moodKeywords?.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {kit.moodKeywords.map((m, i) => <Badge key={i} variant="outline">{m}</Badge>)}
              </div>
            ) : null}
          </div>

          {kit.palette?.length ? (
            <div>
              <p className="font-semibold mb-2">Color palette</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {kit.palette.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => copyHex(c.hex)}
                    className="group text-left rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition"
                  >
                    <div className="h-16 w-full" style={{ background: c.hex }} />
                    <div className="p-2">
                      <p className="text-xs font-semibold truncate">{c.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        {c.hex} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {kit.typography && (kit.typography.heading || kit.typography.body) ? (
            <div>
              <p className="font-semibold mb-1">Typography</p>
              <p className="text-muted-foreground">
                <span className="font-bold text-foreground">{kit.typography.heading}</span>
                {kit.typography.body ? <> + <span className="text-foreground">{kit.typography.body}</span></> : null}
              </p>
              {kit.typography.rationale && <p className="text-xs text-muted-foreground mt-1">{kit.typography.rationale}</p>}
            </div>
          ) : null}

          {kit.logoConcept && (
            <div>
              <p className="font-semibold mb-1">Logo concept</p>
              <p className="text-muted-foreground">{kit.logoConcept}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kit.doList?.length ? (
              <div>
                <p className="font-semibold text-green-600 mb-1">Do</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {kit.doList.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            ) : null}
            {kit.dontList?.length ? (
              <div>
                <p className="font-semibold text-red-600 mb-1">Don't</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {kit.dontList.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
