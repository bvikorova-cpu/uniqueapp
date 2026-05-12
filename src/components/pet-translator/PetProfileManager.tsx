import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Check, PawPrint } from "lucide-react";
import { usePetProfiles, type PetProfile } from "@/hooks/usePetProfiles";

export default function PetProfileManager() {
  const { pets, active, setActive, reload } = usePetProfiles();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<PetProfile>>({ name: "", species: "dog", breed: "", age_years: 0 });

  const save = async () => {
    if (!draft.name) return toast.error("Name is required");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in first");
    const { error } = await supabase.from("pet_profiles").insert({
      user_id: user.id, name: draft.name, species: draft.species || "dog",
      breed: draft.breed, age_years: draft.age_years, gender: draft.gender,
      personality: draft.personality, is_indoor: draft.is_indoor ?? true,
    });
    if (error) return toast.error(error.message);
    toast.success("Pet added");
    setCreating(false); setDraft({ name: "", species: "dog" }); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete pet?")) return;
    await supabase.from("pet_profiles").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    reload();
  };

  return (
    <Card className="p-6 border-primary/20 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><PawPrint className="w-5 h-5 text-primary" /> My Pets</h2>
        <Button size="sm" onClick={() => setCreating((v) => !v)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {creating && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 rounded-lg border border-border/40">
          <div><Label>Name</Label><Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div><Label>Species</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2" value={draft.species || "dog"} onChange={(e) => setDraft({ ...draft, species: e.target.value })}>
              <option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="rabbit">Rabbit</option><option value="other">Other</option>
            </select>
          </div>
          <div><Label>Breed</Label><Input value={draft.breed || ""} onChange={(e) => setDraft({ ...draft, breed: e.target.value })} /></div>
          <div><Label>Age (years)</Label><Input type="number" step="0.5" value={draft.age_years || 0} onChange={(e) => setDraft({ ...draft, age_years: Number(e.target.value) })} /></div>
          <div><Label>Personality</Label><Input placeholder="playful, shy, curious…" value={draft.personality || ""} onChange={(e) => setDraft({ ...draft, personality: e.target.value })} /></div>
          <div className="sm:col-span-2 flex gap-2 justify-end"><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
        </div>
      )}

      {pets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No pets yet. Add your first to personalize translations.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {pets.map((p) => (
            <div key={p.id} className={`p-4 rounded-lg border-2 transition-all ${active?.id === p.id ? "border-primary bg-primary/5" : "border-border/40"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-2">{p.name} {active?.id === p.id && <Badge className="bg-primary">Active</Badge>}</div>
                  <div className="text-xs text-muted-foreground">{p.species}{p.breed ? ` · ${p.breed}` : ""}{p.age_years ? ` · ${p.age_years}y` : ""}</div>
                </div>
                <div className="flex gap-1">
                  {active?.id !== p.id && <Button size="icon" variant="ghost" onClick={() => setActive(p.id)}><Check className="w-4 h-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
