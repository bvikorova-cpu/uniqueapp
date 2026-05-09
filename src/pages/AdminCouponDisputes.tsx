import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface DisputedOrder {
  id: string;
  amount: number;
  buyer_id: string;
  seller_id: string;
  dispute_reason: string | null;
  buyer_disputed_at: string | null;
  coupon_listings: { title: string; store_name: string } | null;
}

const AdminCouponDisputes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading } = useIsAdmin();
  const [orders, setOrders] = useState<DisputedOrder[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => { if (!loading && !isAdmin) navigate("/"); }, [loading, isAdmin, navigate]);
  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  const refresh = async () => {
    const { data } = await supabase.from("coupon_orders")
      .select("id, amount, buyer_id, seller_id, dispute_reason, buyer_disputed_at, coupon_listings(title, store_name)")
      .eq("escrow_status", "disputed")
      .order("buyer_disputed_at", { ascending: true });
    setOrders((data as any) || []);
  };

  const resolve = async (orderId: string, action: "admin-release" | "admin-refund") => {
    setBusy(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke("coupon-buyer-action", {
        body: { action, orderId, note: notes[orderId] || "" },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;
      toast({ title: action === "admin-release" ? "Released to seller" : "Refunded buyer" });
      refresh();
    } catch (e: any) { toast({ title: "Error", description: e?.message ?? "Failed", variant: "destructive" }); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <Helmet><title>Coupon Disputes — Admin</title><meta name="robots" content="noindex" /></Helmet>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-black">Coupon Marketplace Disputes</h1>
          <Badge variant="outline">{orders.length} open</Badge>
        </div>
        {orders.length === 0 && (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No open disputes 🎉</CardContent></Card>
        )}
        <div className="space-y-3">
          {orders.map(o => (
            <Card key={o.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{o.coupon_listings?.title || "—"} <span className="text-muted-foreground font-normal">@ {o.coupon_listings?.store_name}</span></h3>
                    <p className="text-xs text-muted-foreground">Order {o.id.slice(0,8)} · €{Number(o.amount).toFixed(2)} · disputed {o.buyer_disputed_at ? new Date(o.buyer_disputed_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <Badge variant="destructive">Disputed</Badge>
                </div>
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Buyer reason</p>
                  <p>{o.dispute_reason || "(no reason provided)"}</p>
                </div>
                <Textarea placeholder="Resolution note (visible in audit log)" value={notes[o.id] || ""} onChange={e => setNotes(p => ({ ...p, [o.id]: e.target.value }))} className="text-sm" rows={2} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2" disabled={busy === o.id} onClick={() => resolve(o.id, "admin-release")}>
                    <Check className="w-4 h-4" /> Release to seller
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-2" disabled={busy === o.id} onClick={() => resolve(o.id, "admin-refund")}>
                    <X className="w-4 h-4" /> Refund buyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCouponDisputes;
