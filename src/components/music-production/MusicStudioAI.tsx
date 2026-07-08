import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Music, Loader2 } from "lucide-react";

type Concept = {
  title?: string; genre?: string; bpm?: number; key?: string; mood?: string;
  chords?: string[]; structure?: string[]; instruments?: string[];
  mixingTips?: string[]; referenceTracks?: string[];
};

export function MusicStudioAI() {
  const { toast } = useToast();
  const [brief, setBrief] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<Concept | null>(null);

  const generate = async () => {
    setLoading(true);
    setConcept(null);
    try {
      const { data, error } = await supabase.functions.invoke("music-studio-ai", {
        body: { brief, genre: genre || "any", mood: mood || "any" },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setConcept((data as { concept: Concept }).concept);
      toast({ title: "Track concept ready", description: "3 AI credits used." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-2xl font-black">AI Track Ideator</h2>
        <Badge variant="secondary" className="ml-auto">3 credits</Badge>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        Get a complete track concept — BPM, key, chord progression, structure, instruments and mixing tips.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <Input placeholder="Genre (e.g. lo-fi hip hop)" value={genre} onChange={(e) => setGenre(e.target.value)} maxLength={40} />
        <Input placeholder="Mood (e.g. melancholic, uplifting)" value={mood} onChange={(e) => setMood(e.target.value)} maxLength={40} />
      </div>
      <Textarea
        placeholder="Describe the track you want to make (optional)…"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        maxLength={500}
        rows={3}
        className="mb-3"
      />
      <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Music className="w-4 h-4 mr-2" />Generate concept</>}
      </Button>

      {concept && (
        <div className="mt-6 space-y-4 text-sm">
          <div>
            <h3 className="text-xl font-black">{concept.title || "Untitled"}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {concept.genre && <Badge>{concept.genre}</Badge>}
              {concept.bpm ? <Badge variant="outline">{concept.bpm} BPM</Badge> : null}
              {concept.key && <Badge variant="outline">Key: {concept.key}</Badge>}
              {concept.mood && <Badge variant="outline">{concept.mood}</Badge>}
            </div>
          </div>
          {concept.chords?.length ? (
            <Section title="Chord progression">
              <div className="flex flex-wrap gap-2">
                {concept.chords.map((c, i) => <Badge key={i} variant="secondary" className="font-mono">{c}</Badge>)}
              </div>
            </Section>
          ) : null}
          {concept.structure?.length ? (
            <Section title="Song structure">
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                {concept.structure.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </Section>
          ) : null}
          {concept.instruments?.length ? (
            <Section title="Instruments"><Bullets items={concept.instruments} /></Section>
          ) : null}
          {concept.mixingTips?.length ? (
            <Section title="Mixing tips"><Bullets items={concept.mixingTips} /></Section>
          ) : null}
          {concept.referenceTracks?.length ? (
            <Section title="Reference tracks"><Bullets items={concept.referenceTracks} /></Section>
          ) : null}
        </div>
      )}
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold mb-1">{title}</p>
      {children}
    </div>
  );
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}
