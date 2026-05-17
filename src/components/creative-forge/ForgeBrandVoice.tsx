import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BrandVoice {
  id: string;
  name: string;
  description: string | null;
  tone: string | null;
  audience: string | null;
  do_use: string | null;
  dont_use: string | null;
  sample_text: string | null;
  is_default: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect?: (voice: BrandVoice) => void;
}

const EMPTY: Omit<BrandVoice, "id" | "is_default"> = {
  name: "", description: "", tone: "", audience: "", do_use: "", dont_use: "", sample_text: "",
};

export function ForgeBrandVoice({ open, onClose, onSelect }: Props) {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [editing, setEditing] = useState<Partial<BrandVoice> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("creative_forge_brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setVoices((data as BrandVoice[]) || []);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const save = async () => {
    if (!editing?.name?.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { ...EMPTY, ...editing, user_id: user.id };
    if (editing.id) {
      await supabase.from("creative_forge_brand_voices").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("creative_forge_brand_voices").insert(payload);
    }
    setEditing(null); setLoading(false);
    toast({ title: "Brand voice saved" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("creative_forge_brand_voices").delete().eq("id", id);
    load();
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("creative_forge_brand_voices").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("creative_forge_brand_voices").update({ is_default: true }).eq("id", id);
    load();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Voices</DialogTitle>
          <DialogDescription>Save reusable tone profiles. Applied to every generation when selected.</DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Witty SaaS" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tone</Label><Input value={editing.tone ?? ""} onChange={(e) => setEditing({ ...editing, tone: e.target.value })} placeholder="Witty, confident" /></div>
              <div><Label>Audience</Label><Input value={editing.audience ?? ""} onChange={(e) => setEditing({ ...editing, audience: e.target.value })} placeholder="Indie founders" /></div>
            </div>
            <div><Label>Description</Label><Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Do use</Label><Textarea rows={3} value={editing.do_use ?? ""} onChange={(e) => setEditing({ ...editing, do_use: e.target.value })} placeholder="Short sentences, metaphors..." /></div>
              <div><Label>Don't use</Label><Textarea rows={3} value={editing.dont_use ?? ""} onChange={(e) => setEditing({ ...editing, dont_use: e.target.value })} placeholder="Buzzwords, jargon..." /></div>
            </div>
            <div><Label>Sample text</Label><Textarea rows={4} value={editing.sample_text ?? ""} onChange={(e) => setEditing({ ...editing, sample_text: e.target.value })} placeholder="Paste 2–3 sentences in your voice" /></div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={loading}><Check className="h-4 w-4 mr-2" />Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => setEditing(EMPTY as any)} className="w-full"><Plus className="h-4 w-4 mr-2" />New Brand Voice</Button>
            {voices.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No brand voices yet.</p>}
            {voices.map((v) => (
              <Card key={v.id} className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{v.name}</h3>
                    {v.is_default && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Default</Badge>}
                  </div>
                  {v.tone && <p className="text-xs text-muted-foreground">Tone: {v.tone}</p>}
                  {v.description && <p className="text-xs mt-1 line-clamp-2">{v.description}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  {onSelect && <Button size="sm" onClick={() => { onSelect(v); onClose(); }}>Use</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setEditing(v)}>Edit</Button>
                  {!v.is_default && <Button size="sm" variant="ghost" onClick={() => setDefault(v.id)}><Star className="h-3 w-3" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
