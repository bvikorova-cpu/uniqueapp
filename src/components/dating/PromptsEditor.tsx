import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, MessageSquareQuote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PROMPT_QUESTIONS = [
  "Two truths and a lie...",
  "My ideal Sunday looks like...",
  "I'm looking for someone who...",
  "The way to my heart is...",
  "A shower thought I recently had...",
  "I get along best with people who...",
  "My most controversial opinion is...",
  "The best trip I've ever taken was...",
  "I'm weirdly attracted to...",
  "My love language is...",
  "Dating me is like...",
  "Green flags I look for...",
  "My simple pleasures...",
  "I bet you can't...",
  "Together we should...",
];

export interface Prompt {
  q: string;
  a: string;
}

interface Props {
  profileId: string;
  value: Prompt[];
  onChange: (next: Prompt[]) => void;
}

export const PromptsEditor = ({ profileId, value, onChange }: Props) => {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState(PROMPT_QUESTIONS[0]);
  const [newA, setNewA] = useState("");
  const [saving, setSaving] = useState(false);

  const persist = async (next: Prompt[]) => {
    setSaving(true);
    const { error } = await supabase
      .from("dating_profiles")
      .update({ prompts: next as any })
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    onChange(next);
    return true;
  };

  const handleAdd = async () => {
    if (!newA.trim() || value.length >= 3) return;
    const next = [...value, { q: newQ, a: newA.trim().slice(0, 280) }];
    if (await persist(next)) {
      setAdding(false);
      setNewA("");
    }
  };

  const handleRemove = async (i: number) => {
    const next = value.filter((_, idx) => idx !== i);
    await persist(next);
  };

  return (
    <Card className="p-5">
      <FloatingHowItWorks
        title={"Prompts Editor"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          Prompts ({value.length}/3)
        </h3>
        {value.length < 3 && !adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {value.map((p, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 relative">
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-background flex items-center justify-center"
              aria-label="Remove prompt"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground">{p.q}</p>
            <p className="text-sm font-medium mt-1 pr-6">{p.a}</p>
          </div>
        ))}
        {adding && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <Select value={newQ} onValueChange={setNewQ}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q} className="text-xs">
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              placeholder="Your answer..."
              maxLength={280}
              className="min-h-20 text-sm"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">{newA.length}/280</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewA(""); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={!newA.trim() || saving}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
        {value.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground italic">
            Add up to 3 prompts — they show on your card and let matches react to specific answers.
          </p>
        )}
      </div>
    </Card>
  );
};
