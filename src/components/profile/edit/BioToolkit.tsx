import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, FlaskConical, Globe2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SUPPORTED_LANGS = ["sk", "en", "hu", "cs", "de", "es", "fr", "it", "pl", "pt", "uk", "ro"];

export interface BioToolkitProps {
  bio: string;
  score: number | null;
  feedback: string | null;
  variants: string[];
  translations: Record<string, string>;
  onApplyBio: (bio: string) => void;
  onScoreUpdate: (score: number, feedback: string) => void;
  onVariantsUpdate: (variants: string[]) => void;
  onTranslationsUpdate: (translations: Record<string, string>) => void;
}

export const BioToolkit = ({
  bio,
  score,
  feedback,
  variants,
  translations,
  onApplyBio,
  onScoreUpdate,
  onVariantsUpdate,
  onTranslationsUpdate,
}: BioToolkitProps) => {
  const { toast } = useToast();
  const [scoring, setScoring] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);

  const callBio = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("generate-bio", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const runScore = async () => {
    if (!bio?.trim()) {
      toast({ title: "Write a bio first", variant: "destructive" });
      return;
    }
    setScoring(true);
    try {
      const data = await callBio({ action: "score", bio });
      onScoreUpdate(data.score, data.feedback);
      toast({ title: `Bio score: ${data.score}/100` });
    } catch (e: any) {
      toast({ title: "Scoring error", description: e.message, variant: "destructive" });
    } finally {
      setScoring(false);
    }
  };

  const runVariants = async () => {
    if (!bio?.trim()) {
      toast({ title: "Write a bio first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const data = await callBio({ action: "variants", bio, count: 3 });
      onVariantsUpdate(data.variants || []);
      toast({ title: "Generated 3 A/B variants" });
    } catch (e: any) {
      toast({ title: "Generation error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const runTranslate = async (lang: string) => {
    if (!bio?.trim()) return;
    setTranslatingLang(lang);
    try {
      const data = await callBio({ action: "translate", bio, target_lang: lang });
      onTranslationsUpdate({ ...translations, [lang]: data.translation });
      toast({ title: `Translated → ${lang.toUpperCase()}` });
    } catch (e: any) {
      toast({ title: "Translation error", description: e.message, variant: "destructive" });
    } finally {
      setTranslatingLang(null);
    }
  };

  const scoreColor =
    score == null ? "bg-muted/40 text-muted-foreground"
    : score >= 80 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
    : score >= 50 ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
    : "bg-rose-500/15 text-rose-300 border-rose-500/40";

  return (
    <>
      <FloatingHowItWorks title={"Bio Toolkit - How it works"} steps={[{ title: 'Open', desc: 'Access the Bio Toolkit section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bio Toolkit.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mb-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <Label className="font-semibold">AI Bio Toolkit</Label>
      </div>

      {/* Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-3.5 w-3.5" />
            Bio quality score
          </div>
          <Button size="sm" variant="outline" onClick={runScore} disabled={scoring}>
            {scoring ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            Score
          </Button>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-xs ${scoreColor}`}>
          {score == null ? (
            "Not scored yet — click Score to get AI feedback."
          ) : (
            <>
              <div className="font-bold text-lg">{score}/100</div>
              {feedback && <div className="opacity-80 mt-0.5">{feedback}</div>}
            </>
          )}
        </div>
      </div>

      {/* A/B Variants */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <FlaskConical className="h-3.5 w-3.5" />
            A/B variants
          </div>
          <Button size="sm" variant="outline" onClick={runVariants} disabled={generating}>
            {generating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            Generate
          </Button>
        </div>
        {variants.length === 0 ? (
          <p className="text-xs text-muted-foreground">No variants yet.</p>
        ) : (
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="rounded-lg border border-border/50 p-2 text-xs flex items-start gap-2">
                <Badge variant="secondary" className="text-[10px]">V{i + 1}</Badge>
                <span className="flex-1">{v}</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onApplyBio(v)}>
                  Use
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Translations */}
      <div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <Globe2 className="h-3.5 w-3.5" />
          Multi-language profile
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LANGS.map((l) => {
            const has = !!translations[l];
            const busy = translatingLang === l;
            return (
              <Button
                key={l}
                size="sm"
                variant={has ? "secondary" : "outline"}
                className="h-7 px-2 text-[10px] uppercase"
                onClick={() => runTranslate(l)}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : l}
                {has && <span className="ml-1">✓</span>}
              </Button>
            );
          })}
        </div>
        {Object.keys(translations).length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Visitors will see the bio in their language automatically.
          </p>
        )}
      </div>
    </Card>
    </>
  );
};
