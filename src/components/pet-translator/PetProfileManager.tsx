import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Check, PawPrint, Pencil, Upload, Loader2, Gamepad2 } from "lucide-react";
import { usePetProfiles, type PetProfile } from "@/hooks/usePetProfiles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const empty: Partial<PetProfile> = {
  name: "", species: "dog", breed: "", age_years: 0, gender: "unknown", personality: "", photo_url: "",
};

export default function PetProfileManager() {
  const { pets, active, setActive, reload } = usePetProfiles();
  const [editing, setEditing] = useState<Partial<PetProfile> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => setEditing({ ...empty });
  const openEdit = (p: PetProfile) => setEditing({ ...p });
  const close = () => setEditing(null);

  const uploadPhoto = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in first");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from("pet-photos").getPublicUrl(path);
    setEditing((d) => d ? { ...d, photo_url: pub.publicUrl } : d);
    setUploading(false);
  };

  const save = async () => {
    if (!editing?.name?.trim()) return toast.error("Name is required");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in first");
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      species: editing.species || "dog",
      breed: editing.breed || null,
      age_years: editing.age_years ?? null,
      gender: editing.gender || null,
      personality: editing.personality || null,
      photo_url: editing.photo_url || null,
      is_indoor: editing.is_indoor ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("pet_profiles").update(payload).eq("id", editing.id)
      : await supabase.from("pet_profiles").insert({ ...payload, user_id: user.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Updated" : "Pet added");
    close(); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete pet?")) return;
    await supabase.from("pet_profiles").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    reload();
  };

  const importFromVirtual = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in first");
    const { data: vps, error } = await supabase
      .from("pets")
      .select("id, name")
      .eq("user_id", user.id);
    if (error) return toast.error(error.message);
    if (!vps?.length) return toast.info("No Virtual Pets found to import");

    const existing = new Set(pets.map((p) => p.name.toLowerCase()));
    const toImport = vps.filter((v) => !existing.has((v.name || "").toLowerCase()));
    if (!toImport.length) return toast.info("All Virtual Pets already imported");

    const rows = toImport.map((v) => ({
      user_id: user.id, name: v.name || "Pet", species: "other",
    }));
    const { error: insErr } = await supabase.from("pet_profiles").insert(rows);
    if (insErr) return toast.error(insErr.message);
    toast.success(`Imported ${rows.length} pet${rows.length > 1 ? "s" : ""}`);
    reload();
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Profile Manager works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Card className="p-6 border-primary/20 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-xl font-bold flex items-center gap-2"><PawPrint className="w-5 h-5 text-primary" /> My Pets</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={importFromVirtual} title="Copy your Virtual Pets here">
            <Gamepad2 className="w-4 h-4 mr-1" /> Import
          </Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>

      {editing && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 rounded-lg border border-border/40 bg-muted/10">
          <div className="sm:col-span-2 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center">
              {editing.photo_url
                ? <img src={editing.photo_url} alt="pet" className="w-full h-full object-cover" />
                : <PawPrint className="w-8 h-8 text-muted-foreground" />}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4 mr-1" />Photo</>}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG/PNG · max 5 MB</p>
            </div>
          </div>

          <div><Label>Name *</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div><Label>Species</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2" value={editing.species || "dog"} onChange={(e) => setEditing({ ...editing, species: e.target.value })}>
              <option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="rabbit">Rabbit</option><option value="other">Other</option>
            </select>
          </div>
          <div><Label>Breed</Label><Input value={editing.breed || ""} onChange={(e) => setEditing({ ...editing, breed: e.target.value })} /></div>
          <div><Label>Age (years)</Label><Input type="number" min={0} step="0.5" value={editing.age_years ?? 0} onChange={(e) => setEditing({ ...editing, age_years: Number(e.target.value) })} /></div>
          <div><Label>Gender</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2" value={editing.gender || "unknown"} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="unknown">Unknown</option>
            </select>
          </div>
          <div><Label>Personality</Label><Input placeholder="playful, shy, curious…" value={editing.personality || ""} onChange={(e) => setEditing({ ...editing, personality: e.target.value })} /></div>

          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "…" : "Save"}</Button>
          </div>
        </div>
      )}

      {pets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No pets yet. Add your first to personalize translations.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {pets.map((p) => (
            <div key={p.id} className={`p-4 rounded-lg border-2 transition-all ${active?.id === p.id ? "border-primary bg-primary/5" : "border-border/40"}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center flex-shrink-0">
                  {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" /> : <PawPrint className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-2 truncate">{p.name} {active?.id === p.id && <Badge className="bg-primary">Active</Badge>}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.species}{p.breed ? ` · ${p.breed}` : ""}{p.age_years ? ` · ${p.age_years}y` : ""}{p.gender && p.gender !== "unknown" ? ` · ${p.gender}` : ""}
                  </div>
                </div>
                <div className="flex gap-1">
                  {active?.id !== p.id && <Button size="icon" variant="ghost" onClick={() => setActive(p.id)} title="Set active"><Check className="w-4 h-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
    </>
    );
}
