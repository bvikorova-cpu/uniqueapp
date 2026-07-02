import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Star, Trash2, Plus, Sparkles, Pencil, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Pick {
  id: string;
  content_item_id: string;
  week_start: string;
  position: number;
  editor_note: string | null;
  status: "draft" | "online";
  item?: any;
}

export function EditorsPicksView({ onBack }: Props) {
  const { isAdmin } = useIsAdmin();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);

  // Add form
  const [newItemId, setNewItemId] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPublishOnline, setNewPublishOnline] = useState(false);

  // Edit dialog
  const [editing, setEditing] = useState<Pick | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editPosition, setEditPosition] = useState(0);
  const [editStatus, setEditStatus] = useState<"draft" | "online">("draft");

  const load = async () => {
    setLoading(true);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const ws = weekStart.toISOString().slice(0, 10);

    let q = supabase
      .from("stock_editors_picks")
      .select("*")
      .gte("week_start", ws)
      .order("position", { ascending: true });

    if (!isAdmin || !showDrafts) q = q.eq("status", "online");

    const { data, error } = await q;
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

  useEffect(() => { load();   }, [isAdmin, showDrafts]);

  const addPick = async () => {
    if (!newItemId.trim()) { toast.error("Enter content item ID"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Log in"); return; }
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const { error } = await supabase.from("stock_editors_picks").insert({
      content_item_id: newItemId.trim(),
      editor_note: newNote.trim() || null,
      featured_by: session.user.id,
      position: picks.length,
      week_start: weekStart.toISOString().slice(0, 10),
      status: newPublishOnline ? "online" : "draft",
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success(newPublishOnline ? "Published online" : "Saved as draft");
    setNewItemId(""); setNewNote(""); setNewPublishOnline(false); load();
  };

  const removePick = async (id: string) => {
    if (!confirm("Really delete this Editor's Pick?")) return;
    const { error } = await supabase.from("stock_editors_picks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); load();
  };

  const toggleStatus = async (p: Pick) => {
    const next = p.status === "online" ? "draft" : "online";
    const { error } = await supabase.from("stock_editors_picks").update({ status: next } as any).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next === "online" ? "Published online" : "Downloaded to draft");
    load();
  };

  const openEdit = (p: Pick) => {
    setEditing(p);
    setEditNote(p.editor_note || "");
    setEditPosition(p.position);
    setEditStatus(p.status);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("stock_editors_picks").update({
      editor_note: editNote.trim() || null,
      position: editPosition,
      status: editStatus,
    } as any).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null); load();
  };

  return (
    <>
      <FloatingHowItWorks title={"Editors Picks View - How it works"} steps={[{ title: 'Open', desc: 'Access the Editors Picks View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Editors Picks View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6 text-yellow-500" /> Editor's Picks — Weekly Curation</h2>
        {isAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <Switch id="show-drafts" checked={showDrafts} onCheckedChange={setShowDrafts} />
            <Label htmlFor="show-drafts" className="text-sm">Show drafts</Label>
          </div>
        )}
      </div>

      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-yellow-500" />
          <div>
            <h3 className="text-lg font-bold">Weekly hand-picked selection</h3>
            <p className="text-sm text-muted-foreground">The best pieces selected by our editorial team. Updated every week.</p>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card className="p-4 space-y-3 border-primary/30">
          <h3 className="font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add to this week's selection (admin)</h3>
          <Input placeholder="Content item ID (UUID)" value={newItemId} onChange={e => setNewItemId(e.target.value)} />
          <Textarea placeholder="Editor note (optional)" value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Switch id="publish-online" checked={newPublishOnline} onCheckedChange={setNewPublishOnline} />
              <Label htmlFor="publish-online" className="text-sm">
                {newPublishOnline ? "Publish online immediately" : "Save as draft"}
              </Label>
            </div>
            <Button onClick={addPick}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : picks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No picks yet this week.</div>
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
                {p.status === "draft" && (
                  <Badge variant="secondary" className="absolute top-2 left-32">DRAFT</Badge>
                )}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-7 w-7" title={p.status === "online" ? "Download to draft" : "Publish online"} onClick={() => toggleStatus(p)}>
                      {p.status === "online" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => removePick(p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Editor's Pick</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Editor note</Label>
              <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Position (order)</Label>
              <Input type="number" value={editPosition} onChange={e => setEditPosition(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="edit-status" checked={editStatus === "online"} onCheckedChange={(v) => setEditStatus(v ? "online" : "draft")} />
              <Label htmlFor="edit-status">{editStatus === "online" ? "Online (published)" : "Draft (hidden)"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
