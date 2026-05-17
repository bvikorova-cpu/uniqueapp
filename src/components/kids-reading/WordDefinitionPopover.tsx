import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  word: string | null;
  context?: string;
  level?: string;
  onClose: () => void;
  onCreditsUsed?: () => void;
}

interface Def {
  word: string;
  definition: string;
  example: string;
  synonyms?: string[];
  emoji?: string;
}

export const WordDefinitionPopover = ({ word, context, level, onClose, onCreditsUsed }: Props) => {
  const [loading, setLoading] = useState(false);
  const [def, setDef] = useState<Def | null>(null);

  useEffect(() => {
    if (!word) { setDef(null); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setDef(null);
      try {
        const { data, error } = await supabase.functions.invoke("kids-reading-companion", {
          body: { action: "define", word, context, level },
        });
        if (error) throw error;
        if (cancelled) return;
        setDef(data);
        onCreditsUsed?.();
      } catch (e: any) {
        toast.error(e.message || "Could not define that word");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [word]);

  return (
    <Dialog open={!!word} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {def?.emoji} {def?.word ?? word}
          </DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="py-6 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Looking it up…
          </div>
        )}
        {def && !loading && (
          <div className="space-y-3 text-sm">
            <p className="font-medium">{def.definition}</p>
            {def.example && (
              <div className="bg-muted/40 rounded-lg p-3 italic text-muted-foreground">
                "{def.example}"
              </div>
            )}
            {def.synonyms?.length ? (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-1">Similar:</span>
                {def.synonyms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
