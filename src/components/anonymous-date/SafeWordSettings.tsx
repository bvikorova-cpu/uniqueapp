import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  matchId: string;
  currentUserId: string;
}

export const SafeWordSettings = ({ matchId, currentUserId }: Props) => {
  const { toast } = useToast();
  const [word, setWord] = useState("");
  const [existing, setExisting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("anonymous_dating_safe_words")
      .select("safe_word").eq("match_id", matchId).eq("user_id", currentUserId).maybeSingle()
      .then(({ data }) => { if (data) { setExisting(data.safe_word); setWord(data.safe_word); } });
  }, [matchId, currentUserId]);

  const save = async () => {
    if (!word.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("anonymous_dating_safe_words")
      .upsert({ match_id: matchId, user_id: currentUserId, safe_word: word.trim().toLowerCase() }, { onConflict: "match_id,user_id" });
    setSaving(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { setExisting(word.trim().toLowerCase()); toast({ title: "Safe word set", description: "Chat will lock if you type it." }); }
  };

  const remove = async () => {
    setSaving(true);
    await supabase.from("anonymous_dating_safe_words").delete().eq("match_id", matchId).eq("user_id", currentUserId);
    setSaving(false);
    setExisting(null);
    setWord("");
    toast({ title: "Safe word removed" });
  };

  return (
    <Card className="p-3 bg-gradient-to-br from-emerald-500/10 via-card/80 to-cyan-500/10 border-emerald-500/30">
      <FloatingHowItWorks
        title={"Safe Word Settings"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-emerald-400" />
        <p className="text-sm font-bold">Safe Word</p>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">
        If you type this word in chat, the conversation closes immediately. Only you see it.
      </p>
      <div className="flex gap-2">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g. pineapple"
          className="text-sm h-9"
        />
        <Button onClick={save} disabled={saving || !word.trim()} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
        </Button>
        {existing && (
          <Button onClick={remove} disabled={saving} variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {existing && <p className="text-[10px] text-emerald-400 mt-1.5">✓ Active: "{existing}"</p>}
    </Card>
  );
};
