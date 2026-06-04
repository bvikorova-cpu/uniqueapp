import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Sparkles, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price_cents: number;
  eta_days: number;
  category: string | null;
  emoji: string | null;
  seller_name?: string;
}

interface MyOrder {
  id: string;
  listing_id: string;
  price_cents: number;
  status: string;
  listing_title?: string;
}

const MegatalentTalentMarketplace = ({ category }: { category?: string }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: 25, eta_days: 7, emoji: "🎁" });
  const [submitting, setSubmitting] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [releasing, setReleasing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = (supabase as any).from("mt_marketplace_listings").select("*").eq("active", true).order("created_at", { ascending: false });
    if (category) q = q.eq("category", category);
    const { data } = await q;
    const rows = (data || []) as Listing[];
    if (rows.length) {
      const uids = [...new Set(rows.map((r) => r.seller_id))];
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", uids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => (map[p.id] = p.full_name || "Anonymous"));
      rows.forEach((r) => (r.seller_name = map[r.seller_id] || "Anonymous"));
    }
    setListings(rows);
    setLoading(false);
  };

  const loadMyOrders = async (uid: string) => {
    const { data } = await (supabase as any)
      .from("mt_marketplace_orders")
      .select("id, listing_id, price_cents, status")
      .eq("buyer_id", uid)
      .in("status", ["paid", "completed"])
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data || []) as MyOrder[];
    if (rows.length) {
      const lids = [...new Set(rows.map((r) => r.listing_id))];
      const { data: ls } = await (supabase as any).from("mt_marketplace_listings").select("id, title").in("id", lids);
      const map: Record<string, string> = {};
      (ls || []).forEach((l: any) => (map[l.id] = l.title));
      rows.forEach((r) => (r.listing_title = map[r.listing_id] || "Listing"));
    }
    setMyOrders(rows);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) loadMyOrders(uid);
    });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const markCompleted = async (orderId: string) => {
    setReleasing(orderId);
    const { data, error } = await supabase.functions.invoke("mt-release-funds", {
      body: { kind: "marketplace", id: orderId },
    });
    setReleasing(null);
    if (error || (data as any)?.error) {
      toast.error("Release failed", { description: error?.message || (data as any)?.error });
      return;
    }
    toast.success("Order completed — 80% sent to seller");
    if (userId) loadMyOrders(userId);
  };

  const buy = async (l: Listing) => {
    if (!userId) {
      toast.error("Sign in to order");
      return;
    }
    if (l.seller_id === userId) {
      toast.error("Cannot buy your own listing");
      return;
    }
    setBuying(l.id);
    const { data: order, error } = await (supabase as any)
      .from("mt_marketplace_orders")
      .insert({
        listing_id: l.id,
        buyer_id: userId,
        seller_id: l.seller_id,
        price_cents: l.price_cents,
      })
      .select("id")
      .single();
    if (error || !order) {
      setBuying(null);
      toast.error("Order failed", { description: error?.message });
      return;
    }
    const { data: co, error: coErr } = await supabase.functions.invoke("mt-checkout", {
      body: { kind: "marketplace", id: order.id },
    });
    setBuying(null);
    if (coErr || !(co as any)?.url) {
      toast.error("Checkout failed", { description: coErr?.message || (co as any)?.error });
      return;
    }
    window.location.href = (co as any).url;
  };

  const create = async () => {
    if (!userId) return;
    if (form.title.length < 3) {
      toast.error("Title too short");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("mt_marketplace_listings").insert({
      seller_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      price_cents: Math.max(100, Math.round(form.price * 100)),
      eta_days: Math.max(1, Math.min(60, form.eta_days)),
      emoji: form.emoji || "🎁",
      category: category || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Create failed", { description: error.message });
      return;
    }
    toast.success("Listing published");
    setCreateOpen(false);
    setForm({ title: "", description: "", price: 25, eta_days: 7, emoji: "🎁" });
    load();
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">Talent Marketplace</h3>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> Escrow · 80/20
          </Badge>
          {userId && (
            <Button size="sm" variant="outline" className="ml-auto h-8 gap-1" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3 w-3" /> Sell something
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Commission custom work from verified talents.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : listings.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No listings yet. Create the first one!
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {listings.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/40 bg-background/40 p-3 flex flex-col"
              >
                <div className="text-3xl mb-2">{l.emoji || "🎁"}</div>
                <div className="text-sm font-semibold leading-tight line-clamp-2">{l.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  by {l.seller_name} · {l.eta_days}d
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="font-bold text-primary">€{(l.price_cents / 100).toFixed(0)}</span>
                  <Button size="sm" variant="secondary" onClick={() => buy(l)} disabled={buying === l.id || l.seller_id === userId}>
                    {buying === l.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Order"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create marketplace listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="What are you offering?"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value.slice(0, 120) }))}
              />
              <Textarea
                placeholder="Describe what the buyer will get"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, 1000) }))}
                rows={3}
              />
              <Input
                placeholder="Emoji"
                value={form.emoji}
                onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value.slice(0, 4) }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Price (€)</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Math.max(1, Number(e.target.value) || 0) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Delivery (days)</label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={form.eta_days}
                    onChange={(e) => setForm((p) => ({ ...p, eta_days: Math.max(1, Math.min(60, Number(e.target.value) || 1)) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={create} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MegatalentTalentMarketplace;
