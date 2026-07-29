import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, Star, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  activeVoiceId?: string | null;
  onClearActive?: () => void;
}


const EMPTY: Omit<BrandVoice, "id" | "is_default"> = { name: "", description: "", tone: "", audience: "", do_use: "", dont_use: "", sample_text: "" };

const STARTER_VOICES: Omit<BrandVoice, "id" | "is_default">[] = [
  {
    name: "Witty SaaS",
    description: "Playful but sharp product voice for founders and builders.",
    tone: "Witty, confident, concise",
    audience: "Indie founders and product teams",
    do_use: "Short punchy sentences, concrete examples, light humour, active voice",
    dont_use: "Corporate buzzwords, hype adjectives, exclamation marks",
    sample_text: "Shipping shouldn't feel like paperwork. Write the idea, hit publish, move on to the next one.",
  },
  {
    name: "Warm Storyteller",
    description: "Cinematic narrative voice for fiction and personal essays.",
    tone: "Warm, vivid, reflective",
    audience: "Readers of literary fiction and memoir",
    do_use: "Sensory detail, rhythm, metaphors, intimate second-person moments",
    dont_use: "Clichés, exposition dumps, technical jargon",
    sample_text: "The kitchen still smelled of rain and burnt sugar, the way it always did the morning after she left.",
  },
  {
    name: "Clear Expert",
    description: "Authoritative educational voice for guides and explainers.",
    tone: "Clear, calm, authoritative",
    audience: "Professionals looking for practical answers",
    do_use: "Plain language, numbered steps, definitions before detail",
    dont_use: "Slang, filler intros, unsupported claims",
    sample_text: "There are three ways to solve this. Start with the simplest one and only escalate if it fails.",
  },
  {
    name: "Bold Creator",
    description: "High-energy social voice for short-form content and hooks.",
    tone: "Bold, energetic, direct",
    audience: "Social audiences on short-form platforms",
    do_use: "Strong hooks, one idea per line, direct address, momentum",
    dont_use: "Long paragraphs, hedging, passive voice",
    sample_text: "Stop editing in the dark. Here's the 20-second check that saves your whole draft.",
  },
];

export function ForgeBrandVoice({ open, onClose, onSelect, activeVoiceId, onClearActive }: Props) {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [editing, setEditing] = useState<Partial<BrandVoice> | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("creative_forge_brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) { toast({ title: "Couldn't load brand voices", description: error.message, variant: "destructive" }); return; }
    setVoices((data as BrandVoice[]) || []);
  };

  useEffect(() => { if (open) load(); }, [open]);

  const save = async () => {
    if (!editing?.name?.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
      const payload = { ...EMPTY, ...editing, user_id: user.id };
      const { error } = editing.id
        ? await supabase.from("creative_forge_brand_voices").update(payload).eq("id", editing.id)
        : await supabase.from("creative_forge_brand_voices").insert(payload);
      if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
      setEditing(null);
      toast({ title: "Brand voice saved" });
      load();
    } finally {
      setLoading(false);
    }
  };

  const addStarter = async (preset: Omit<BrandVoice, "id" | "is_default">) => {
    setSeeding(preset.name);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
      const { error } = await supabase
        .from("creative_forge_brand_voices")
        .insert({ ...preset, user_id: user.id, is_default: voices.length === 0 });
      if (error) { toast({ title: "Couldn't add voice", description: error.message, variant: "destructive" }); return; }
      toast({ title: `"${preset.name}" added` });
      load();
    } finally {
      setSeeding(null);
    }
  };

  const addAllStarters = async () => {
    setSeeding("__all__");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
      const existing = new Set(voices.map((v) => v.name.toLowerCase()));
      const rows = STARTER_VOICES.filter((p) => !existing.has(p.name.toLowerCase()))
        .map((p, i) => ({ ...p, user_id: user.id, is_default: voices.length === 0 && i === 0 }));
      if (rows.length === 0) { toast({ title: "All starter voices are already saved" }); return; }
      const { error } = await supabase.from("creative_forge_brand_voices").insert(rows);
      if (error) { toast({ title: "Couldn't add voices", description: error.message, variant: "destructive" }); return; }
      toast({ title: `${rows.length} brand voices added` });
      load();
    } finally {
      setSeeding(null);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("creative_forge_brand_voices").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("creative_forge_brand_voices").update({ is_default: false }).eq("user_id", user.id);
    const { error } = await supabase.from("creative_forge_brand_voices").update({ is_default: true }).eq("id", id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    load();
  };

  return (
    <>
      <FloatingHowItWorks title={"Forge Brand Voice - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Brand Voice section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Brand Voice.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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

            <div className="rounded-lg border border-dashed p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4" />Starter voices</p>
                  <p className="text-xs text-muted-foreground">Add a ready-made profile and tweak it later.</p>
                </div>
                <Button size="sm" variant="secondary" onClick={addAllStarters} disabled={seeding !== null}>
                  {seeding === "__all__" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add all"}
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {STARTER_VOICES.map((p) => {
                  const already = voices.some((v) => v.name.toLowerCase() === p.name.toLowerCase());
                  return (
                    <Card key={p.name} className="p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold truncate">{p.name}</h4>
                        {already && <Badge variant="outline" className="text-[10px]">Saved</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs" disabled={already || seeding !== null} onClick={() => addStarter(p)}>
                          {seeding === p.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" />Add</>}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(p as any)}>Customize</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {voices.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No saved brand voices yet — pick a starter above.</p>}
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
    </>
  );
}
