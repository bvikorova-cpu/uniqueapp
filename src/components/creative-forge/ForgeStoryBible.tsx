import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TYPES = [
  { id: "character", label: "Character" },
  { id: "place", label: "Place" },
  { id: "plot", label: "Plot beat" },
  { id: "lore", label: "Lore" },
  { id: "object", label: "Object" },
  { id: "timeline", label: "Timeline" },
];

interface Entry {
  id: string;
  entry_type: string;
  name: string;
  summary: string | null;
  tags: string[];
}

interface Props { open: boolean; onClose: () => void; }

export function ForgeStoryBible({ open, onClose }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Partial<Entry> | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("creative_forge_story_bible")
      .select("id, entry_type, name, summary, tags")
      .eq("user_id", user.id)
      .order("entry_type")
      .order("name");
    setEntries((data as Entry[]) || []);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const save = async () => {
    if (!editing?.name?.trim() || !editing.entry_type) { toast({ title: "Name & type required", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id,
      entry_type: editing.entry_type,
      name: editing.name,
      summary: editing.summary ?? "",
      tags: editing.tags ?? [],
    };
    if (editing.id) {
      await supabase.from("creative_forge_story_bible").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("creative_forge_story_bible").insert(payload);
    }
    toast({ title: "Saved to Story Bible" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("creative_forge_story_bible").delete().eq("id", id);
    load();
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.entry_type === filter);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Story Bible</DialogTitle>
          <DialogDescription>Track characters, places, plot beats and lore across chapters. Persistent reference for long-form writing.</DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type *</Label>
                <Select value={editing.entry_type ?? ""} onValueChange={(v) => setEditing({ ...editing, entry_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick type" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Name *</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            </div>
            <div><Label>Summary</Label><Textarea rows={6} value={editing.summary ?? ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} placeholder="Description, traits, role, key facts..." /></div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="hero, ally, redemption-arc" />
            </div>
            <div className="flex gap-2">
              <Button onClick={save}><Check className="h-4 w-4 mr-2" />Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={() => setEditing({ entry_type: "character" })} className="flex-1"><Plus className="h-4 w-4 mr-2" />New Entry</Button>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No entries yet.</p>}
            {filtered.map((e) => (
              <Card key={e.id} className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{e.entry_type}</Badge>
                    <h3 className="font-semibold truncate">{e.name}</h3>
                  </div>
                  {e.summary && <p className="text-xs mt-1 line-clamp-3">{e.summary}</p>}
                  {e.tags.length > 0 && <div className="flex gap-1 mt-1 flex-wrap">{e.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>}
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(e)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
