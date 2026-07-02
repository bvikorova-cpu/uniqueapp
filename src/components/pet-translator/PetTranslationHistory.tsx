import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Trash2, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Row {
  id: string; kind: string; emotion: string | null; text_result: string | null;
  audio_url: string | null; photo_url: string | null; is_favorite: boolean | null; created_at: string;
}

export default function PetTranslationHistory({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pet_translations").select("*").order("created_at", { ascending: false }).limit(100);
    setRows((data as Row[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleFav = async (id: string, v: boolean) => {
    await supabase.from("pet_translations").update({ is_favorite: !v }).eq("id", id); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this translation?")) return;
    await supabase.from("pet_translations").delete().eq("id", id); toast.success("Deleted"); load();
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Translation History works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><HistoryIcon className="w-5 h-5 text-primary" /> Translation History</h2>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          rows.length === 0 ? <p className="text-sm text-muted-foreground">No translations yet.</p> :
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded-lg border border-border/40 bg-muted/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.kind}</Badge>
                    {r.emotion && <Badge>{r.emotion}</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleFav(r.id, !!r.is_favorite)}>
                      <Star className={`w-4 h-4 ${r.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                {r.audio_url && <audio src={r.audio_url} controls className="w-full mb-2 h-8" />}
                {r.photo_url && <img src={r.photo_url} alt="pet" className="rounded-md max-h-32 mb-2" />}
                <p className="text-sm whitespace-pre-wrap line-clamp-3">{r.text_result}</p>
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>}
      </Card>
    </div>
    </>
    );
}
