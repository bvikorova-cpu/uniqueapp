import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Gem, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalCollectionTool = () => {
  const [crystals, setCrystals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crystal_name: "", crystal_type: "", notes: "" });

  const fetchCollection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await (supabase as any).from("crystal_user_collections").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setCrystals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCollection(); }, []);

  const addCrystal = async () => {
    if (!form.crystal_name.trim()) { toast.error("Crystal name is required"); return; }
    setAdding(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); setAdding(false); return; }
    const { error } = await (supabase as any).from("crystal_user_collections").insert({
      user_id: session.user.id,
      crystal_name: form.crystal_name,
      crystal_type: form.crystal_type || null,
      notes: form.notes || null,
    });
    if (error) { toast.error("Failed to add crystal"); }
    else {
      toast.success("Crystal added to collection! 💎");
      await (supabase as any).rpc("increment_crystal_stat", { p_user_id: session.user.id, p_stat: "crystals", p_value: 1 });
      setForm({ crystal_name: "", crystal_type: "", notes: "" });
      setShowForm(false);
      fetchCollection();
    }
    setAdding(false);
  };

  const removeCrystal = async (id: string) => {
    await (supabase as any).from("crystal_user_collections").delete().eq("id", id);
    toast.success("Crystal removed");
    fetchCollection();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Crystal Collection Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Collection Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Collection Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Gem className="w-5 h-5" /> My Crystal Collection
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
        </div>
        <p className="text-sm text-muted-foreground">{crystals.length} crystals in your collection</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="space-y-1.5"><Label>Crystal Name *</Label><Input value={form.crystal_name} onChange={e => setForm(f => ({ ...f, crystal_name: e.target.value }))} placeholder="e.g. Amethyst" /></div>
            <div className="space-y-1.5"><Label>Type / Variety</Label><Input value={form.crystal_type} onChange={e => setForm(f => ({ ...f, crystal_type: e.target.value }))} placeholder="e.g. Tumbled, Raw, Cluster" /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Where you got it, how it makes you feel..." rows={2} /></div>
            <Button onClick={addCrystal} disabled={adding} className="w-full gap-2">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add to Collection
            </Button>
          </div>
        )}
        {crystals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gem className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your collection is empty. Add your first crystal!</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {crystals.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
                <div>
                  <h4 className="font-bold text-sm">{c.crystal_name}</h4>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {c.crystal_type && <span>{c.crystal_type}</span>}
                    <span>Added {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive" onClick={() => removeCrystal(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
