import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, Trash2, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

interface Props { onBack: () => void; }

interface Pick {
  id: string;
  content_item_id: string;
  week_start: string;
  position: number;
  editor_note: string | null;
  item?: any;
}

export function EditorsPicksView({ onBack }: Props) {
  const { isAdmin } = useIsAdmin();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemId, setNewItemId] = useState("");
  const [newNote, setNewNote] = useState("");

  const load = async () => {
    setLoading(true);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const ws = weekStart.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("stock_editors_picks")
      .select("*")
      .gte("week_start", ws)
      .order("position", { ascending: true });

    if (error) { toast.error(error.message); setLoading(false); return; }

    const ids = (data || []).map((p: any) => p.content_item_id);
    let items: any[] = [];
    if (ids.length) {
      const { data: it } = await supabase
        .from("stock_content_items")
        .select("id,title,thumbnail_url,price_eur,category,total_downloads")
        .in("id", ids);
      items = it || [];
    }
    setPicks((data || []).map((p: any) => ({ ...p, item: items.find(i => i.id === p.content_item_id) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addPick = async () => {
    if (!newItemId.trim()) { toast.error("Vlož content item ID"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Prihlás sa"); return; }
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const { error } = await supabase.from("stock_editors_picks").insert({
      content_item_id: newItemId.trim(),
      editor_note: newNote.trim() || null,
      featured_by: session.user.id,
      position: picks.length,
      week_start: weekStart.toISOString().slice(0, 10),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Pridané do Editor's Picks");
    setNewItemId(""); setNewNote(""); load();
  };

  const removePick = async (id: string) => {
    const { error } = await supabase.from("stock_editors_picks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Odstránené"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" /> Editor's Picks — Weekly Curation</h2>
      </div>

      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-yellow-500" />
          <div>
            <h3 className="text-lg font-bold">Týždenný hand-picked výber</h3>
            <p className="text-sm text-muted-foreground">Najlepšie kúsky vybrané našou redakciou. Aktualizované každý týždeň.</p>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card className="p-4 space-y-3 border-primary/30">
          <h3 className="font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Pridať do tohtotýždňového výberu (admin)</h3>
          <Input placeholder="Content item ID (UUID)" value={newItemId} onChange={e => setNewItemId(e.target.value)} />
          <Textarea placeholder="Editor note (voliteľné)" value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} />
          <Button onClick={addPick}>Pridať</Button>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Načítavam...</div>
      ) : picks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Tento týždeň zatiaľ žiadne picks.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {picks.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                {p.item?.thumbnail_url ? (
                  <img src={p.item.thumbnail_url} alt={p.item?.title || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Star className="w-12 h-12 text-yellow-500/50" /></div>
                )}
                <Badge className="absolute top-2 left-2 bg-yellow-500"><Star className="w-3 h-3 mr-1" /> Editor's Pick</Badge>
                {isAdmin && (
                  <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removePick(p.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold line-clamp-1">{p.item?.title || "—"}</h3>
                {p.editor_note && <p className="text-sm italic text-muted-foreground border-l-2 border-yellow-500 pl-2">"{p.editor_note}"</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">{p.item?.category || "—"}</Badge>
                  <span>€{Number(p.item?.price_eur || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
