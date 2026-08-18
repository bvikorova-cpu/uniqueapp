import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BazaarPromoteDialog } from "@/components/bazaar/BazaarPromoteDialog";
import { ArrowLeft, Crown, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, CheckCircle2, Flame } from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Fashion" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books & Media" },
  { value: "vehicles", label: "Vehicles" },
  { value: "hobby", label: "Hobby" },
  { value: "other", label: "Other" },
];
const CONDITIONS = ["Like New", "Very Good", "Good", "Used"];

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  category: string | null;
  condition: string | null;
  is_active: boolean | null;
  is_sold: boolean | null;
  image_urls: string[] | null;
  image_url: string | null;
  featured_until: string | null;
  premium_until: string | null;
  created_at: string;
}

const isLive = (d: string | null) => !!d && new Date(d) > new Date();

export default function BazaarMy() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", location: "", category: "other", condition: "Good" });

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }
    const { data, error } = await supabase
      .from("bazaar_items")
      .select("id,title,description,price,location,category,condition,is_active,is_sold,image_urls,image_url,featured_until,premium_until,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Could not load your listings", variant: "destructive" });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openEdit = (it: Item) => {
    setForm({
      title: it.title || "",
      description: it.description || "",
      price: String(it.price ?? ""),
      location: it.location || "",
      category: it.category || "other",
      condition: it.condition || "Good",
    });
    setEditTarget(it);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!form.title || !form.price) { toast({ title: "Title and price are required", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("bazaar_items").update({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        category: form.category,
        condition: form.condition,
      }).eq("id", editTarget.id);
      if (error) throw error;
      toast({ title: "Listing updated" });
      setEditTarget(null);
      load();
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const patch = async (it: Item, values: { is_active?: boolean; is_sold?: boolean }, msg: string) => {
    const { error } = await supabase.from("bazaar_items").update(values).eq("id", it.id);
    if (error) { toast({ title: "Action failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: msg });
    load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const { error } = await supabase.from("bazaar_items").delete().eq("id", deleteTarget.id);
    setBusy(false);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setItems((p) => p.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: "Listing deleted", description: "Credits already spent are not refunded." });
  };

  return (
    <>
      <SEO title="My Bazaar listings — edit, pause and delete" description="Manage your Bazaar listings: edit details, mark as sold, pause, promote or delete." canonical="/bazaar/my" />
      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-20">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => nav("/bazaar")}>
          <ArrowLeft className="h-4 w-4" /> Back to Bazaar
        </Button>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My listings</h1>
            <p className="text-sm text-muted-foreground">Edit details, mark as sold, pause, promote or delete your listings.</p>
          </div>
          <Button className="gap-2" onClick={() => nav("/bazaar/create")}><Plus className="h-4 w-4" /> New listing · 2 credits</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">You have no listings yet.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {items.map((it) => {
              const img = it.image_urls?.[0] || it.image_url;
              return (
                <Card key={it.id} className="overflow-hidden border-primary/15">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {img && <img src={img} alt={it.title} loading="lazy" className="h-16 w-16 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">{it.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">€{Number(it.price).toFixed(2)} · {it.location || "—"}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {it.is_sold && <Badge variant="secondary">Sold</Badge>}
                          {!it.is_active && <Badge variant="outline">Paused</Badge>}
                          {isLive(it.premium_until) && <Badge className="gap-1"><Crown className="h-3 w-3" /> Premium</Badge>}
                          {isLive(it.featured_until) && <Badge variant="secondary" className="gap-1"><Flame className="h-3 w-3" /> Top</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(it)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => patch(it, { is_active: !it.is_active }, it.is_active ? "Listing paused" : "Listing published")}>
                      {it.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Pause</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => patch(it, { is_sold: !it.is_sold }, it.is_sold ? "Marked as available" : "Marked as sold")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> {it.is_sold ? "Mark available" : "Mark sold"}
                    </Button>
                    <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setPromoteId(it.id)}><Crown className="h-3.5 w-3.5" /> Promote</Button>
                    <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setDeleteTarget(it)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit listing</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea rows={5} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input type="number" inputMode="decimal" placeholder="Price (€)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input placeholder="City / area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
              <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">E-mails, phone numbers and links are removed automatically — buyers unlock your chat for 2 credits.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={busy} className="gap-2">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. Credits already spent on publishing or promotion are not refunded.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={busy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BazaarPromoteDialog itemId={promoteId} open={!!promoteId} onOpenChange={(v) => !v && setPromoteId(null)} onPromoted={load} />
    </>
  );
}
