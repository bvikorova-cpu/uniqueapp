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
import { CouponPromoteDialog } from "@/components/coupon/CouponPromoteDialog";
import { ArrowLeft, Crown, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, CheckCircle2, Flame } from "lucide-react";

const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel" },
  { value: "beauty", label: "Beauty & Spa" },
  { value: "tech", label: "Tech & Electronics" },
  { value: "general", label: "General" },
];

const TYPES = [
  { value: "discount_code", label: "Discount Code" },
  { value: "gift_card", label: "Gift Card" },
  { value: "voucher", label: "Voucher" },
  { value: "cashback", label: "Cashback Offer" },
  { value: "bogo", label: "Buy One Get One" },
];

interface Coupon {
  id: string;
  title: string;
  description: string | null;
  store_name: string | null;
  original_value: number | null;
  selling_price: number | null;
  category: string | null;
  coupon_type: string | null;
  expiry_date: string | null;
  location: string | null;
  terms_conditions: string | null;
  image_url: string | null;
  is_active: boolean | null;
  is_sold: boolean | null;
  featured_until: string | null;
  premium_until: string | null;
  created_at: string;
}

const isLive = (d: string | null) => !!d && new Date(d) > new Date();

export default function CouponMy() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", store_name: "", original_value: "", selling_price: "",
    category: "general", coupon_type: "discount_code", expiry_date: "", location: "", terms_conditions: "",
  });

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }
    const { data, error } = await supabase
      .from("coupon_listings")
      .select("id,title,description,store_name,original_value,selling_price,category,coupon_type,expiry_date,location,terms_conditions,image_url,is_active,is_sold,featured_until,premium_until,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Could not load your coupons", variant: "destructive" });
    setCoupons((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openEdit = (c: Coupon) => {
    setForm({
      title: c.title || "",
      description: c.description || "",
      store_name: c.store_name || "",
      original_value: String(c.original_value ?? ""),
      selling_price: String(c.selling_price ?? ""),
      category: c.category || "general",
      coupon_type: c.coupon_type || "discount_code",
      expiry_date: c.expiry_date || "",
      location: c.location || "",
      terms_conditions: c.terms_conditions || "",
    });
    setEditTarget(c);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!form.title || !form.selling_price) { toast({ title: "Title and price are required", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("coupon_listings").update({
        title: form.title,
        description: form.description,
        store_name: form.store_name,
        original_value: form.original_value ? Number(form.original_value) : null,
        selling_price: Number(form.selling_price),
        category: form.category,
        coupon_type: form.coupon_type,
        expiry_date: form.expiry_date || null,
        location: form.location,
        terms_conditions: form.terms_conditions,
      }).eq("id", editTarget.id);
      if (error) throw error;
      toast({ title: "Coupon updated" });
      setEditTarget(null);
      load();
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const patch = async (c: Coupon, values: { is_active?: boolean; is_sold?: boolean }, msg: string) => {
    const { error } = await supabase.from("coupon_listings").update(values).eq("id", c.id);
    if (error) { toast({ title: "Action failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: msg });
    load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const { error } = await supabase.from("coupon_listings").delete().eq("id", deleteTarget.id);
    setBusy(false);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setCoupons((p) => p.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: "Coupon deleted", description: "Credits already spent are not refunded." });
  };

  return (
    <>
      <SEO title="My coupon listings — edit, pause and delete" description="Manage your coupon listings: edit details, mark as sold, pause, promote or delete." canonical="/coupon-marketplace/my" />
      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-20">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => nav("/coupon-marketplace")}>
          <ArrowLeft className="h-4 w-4" /> Back to Coupon Marketplace
        </Button>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My coupons</h1>
            <p className="text-sm text-muted-foreground">Edit details, mark as sold, pause, promote or delete your listings.</p>
          </div>
          <Button className="gap-2" onClick={() => nav("/coupon-marketplace/create")}><Plus className="h-4 w-4" /> New coupon · 2 credits</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : coupons.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">You have no coupon listings yet.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {coupons.map((c) => (
              <Card key={c.id} className="overflow-hidden border-primary/15">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {c.image_url && <img src={c.image_url} alt={c.title} loading="lazy" className="h-16 w-16 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{c.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        €{Number(c.selling_price ?? 0).toFixed(2)}
                        {c.original_value ? <span className="ml-2 line-through">€{Number(c.original_value).toFixed(2)}</span> : null}
                        {c.store_name ? ` · ${c.store_name}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.is_sold && <Badge variant="secondary">Sold</Badge>}
                        {!c.is_active && <Badge variant="outline">Paused</Badge>}
                        {isLive(c.premium_until) && <Badge className="gap-1"><Crown className="h-3 w-3" /> Premium</Badge>}
                        {isLive(c.featured_until) && <Badge variant="secondary" className="gap-1"><Flame className="h-3 w-3" /> Top</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => patch(c, { is_active: !c.is_active }, c.is_active ? "Coupon paused" : "Coupon published")}>
                    {c.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Pause</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => patch(c, { is_sold: !c.is_sold }, c.is_sold ? "Marked as available" : "Marked as sold")}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {c.is_sold ? "Mark available" : "Mark sold"}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setPromoteId(c.id)}><Crown className="h-3.5 w-3.5" /> Promote</Button>
                  <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit coupon</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Store / brand" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
            <Textarea rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input type="number" inputMode="decimal" placeholder="Original value (€)" value={form.original_value} onChange={(e) => setForm({ ...form, original_value: e.target.value })} />
              <Input type="number" inputMode="decimal" placeholder="Selling price (€)" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.coupon_type} onValueChange={(v) => setForm({ ...form, coupon_type: v })}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              <Input placeholder="City / area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <Textarea rows={3} placeholder="Terms & conditions" value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} />
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
            <AlertDialogTitle>Delete this coupon listing?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. Credits already spent on publishing or promotion are not refunded.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={busy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CouponPromoteDialog couponId={promoteId} open={!!promoteId} onOpenChange={(v) => !v && setPromoteId(null)} onPromoted={load} />
    </>
  );
}
