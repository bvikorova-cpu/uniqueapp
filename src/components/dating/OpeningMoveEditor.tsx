import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PRESETS = [
  "What's the best meal you've ever cooked?",
  "Most spontaneous thing you've done?",
  "Describe your perfect Sunday in 3 emojis.",
  "Hottest take you have on dating apps?",
  "What's a song that always lifts your mood?",
];

interface Props { userId: string; initial?: string | null; onSaved?: (v: string) => void; }

export const OpeningMoveEditor = ({ userId, initial, onSaved }: Props) => {
  const { toast } = useToast();
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!value.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("dating_profiles")
      .update({ opening_move: value.trim().slice(0, 140) }).eq("user_id", userId);
    setSaving(false);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
    else { toast({ title: "Opening Move saved" }); onSaved?.(value.trim()); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" /> Opening Move
        </CardTitle>
        <p className="text-xs text-muted-foreground">A question matches must answer before chatting — get straight past "hey".</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} maxLength={140} placeholder="Your question..." />
        <div className="flex flex-wrap gap-1">
          {PRESETS.map(p => (
            <Button key={p} size="sm" variant="outline" className="text-xs h-7" onClick={() => setValue(p)}>{p.slice(0, 30)}…</Button>
          ))}
        </div>
        <Button onClick={save} disabled={saving || !value.trim()} size="sm" className="w-full">Save</Button>
      </CardContent>
    </Card>
  );
};
