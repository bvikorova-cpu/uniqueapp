import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  matchId: string;
  matchProfile: any;
  recentMessages: { content: string; mine: boolean }[];
  onPick: (text: string, experimentId: string | null) => void;
}

export const AIStarterButton = ({ matchId, matchProfile, recentMessages, onPick }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [starters, setStarters] = useState<string[]>([]);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dating-ai-coach", {
        body: { action: "conversation_starter", matchId, matchProfile, recentMessages },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStarters(data.starters || []);
      setExperimentId(data.experiment_id || null);
      setOpen(true);
    } catch (e: any) {
      toast({ title: "AI starter failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <FloatingHowItWorks
        title={"A I Starter Button"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => { e.preventDefault(); if (!open) generate(); else setOpen(false); }}
          className="h-10 w-10 text-primary"
          title="AI conversation starter"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center justify-between">
          <span>AI suggestions</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "↻"}
          </Button>
        </div>
        {starters.length === 0 && !loading && (
          <p className="px-2 py-2 text-xs text-muted-foreground">No suggestions yet.</p>
        )}
        <div className="space-y-1">
          {starters.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onPick(s, experimentId); setOpen(false); }}
              className="w-full text-left text-sm px-2 py-2 rounded-md hover:bg-muted transition-colors leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
