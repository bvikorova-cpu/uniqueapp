import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Truck, CheckCircle2, Package } from "lucide-react";

interface ShippingRow {
  id: string;
  user_id: string;
  user_email: string | null;
  member_number: number;
  status: string;
  is_founding: boolean;
  recipient_name: string | null;
  phone: string | null;
  shipping_address: any;
  shipping_note: string | null;
  shipping_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  started_at: string;
}

export default function AdminClubShipping() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ShippingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "shipped" | "all">("pending");
  const [tracking, setTracking] = useState<Record<string, string>>({});

  const load = async (nextFilter = filter) => {
    setLoading(true);
    try {
      const status =
        nextFilter === "all" ? ["pending", "shipped"] : [nextFilter];
      const { data, error } = await supabase.functions.invoke("admin-club-shipping", {
        body: { action: "list", status },
      });
      if (error) throw error;
      setRows((data as any)?.items ?? []);
    } catch (e) {
      toast({ title: "Load failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); /* eslint-disable-next-line */ }, [filter]);

  const markShipped = async (row: ShippingRow) => {
    try {
      const t = (tracking[row.id] ?? "").trim();
      const { error } = await supabase.functions.invoke("admin-club-shipping", {
        body: { action: "mark_shipped", membershipId: row.id, trackingNumber: t || null },
      });
      if (error) throw error;
      toast({ title: "Marked as shipped" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const markDelivered = async (row: ShippingRow) => {
    try {
      const { error } = await supabase.functions.invoke("admin-club-shipping", {
        body: { action: "mark_delivered", membershipId: row.id },
      });
      if (error) throw error;
      toast({ title: "Marked as delivered" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">VIP Club — Physical Card Shipping</h1>
        <div className="flex gap-2">
          {(["pending", "shipped", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No {filter} shipments right now.
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => {
            const a = row.shipping_address?.address ?? row.shipping_address ?? {};
            const address = [a.line1, a.line2, a.postal_code, a.city, a.state, a.country]
              .filter(Boolean).join(", ");
            return (
              <Card key={row.id} className="p-4 grid md:grid-cols-[1fr_auto] gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">#{String(row.member_number).padStart(4, "0")}</Badge>
                    {row.is_founding && <Badge className="bg-amber-500">FOUNDING</Badge>}
                    <Badge variant="secondary">{row.shipping_status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Joined {new Date(row.started_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div><strong>Recipient:</strong> {row.recipient_name ?? "—"}</div>
                    <div><strong>Email:</strong> {row.user_email ?? "—"}</div>
                    <div><strong>Phone:</strong> {row.phone ?? "—"}</div>
                    <div><strong>Address:</strong> {address || "—"}</div>
                    {row.shipping_note && <div><strong>Note:</strong> {row.shipping_note}</div>}
                    {row.tracking_number && <div><strong>Tracking:</strong> <code>{row.tracking_number}</code></div>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-64">
                  {row.shipping_status === "pending" && (
                    <>
                      <Input
                        placeholder="Tracking # (optional)"
                        value={tracking[row.id] ?? ""}
                        onChange={(e) => setTracking((t) => ({ ...t, [row.id]: e.target.value }))}
                      />
                      <Button onClick={() => markShipped(row)}>
                        <Truck className="h-4 w-4 mr-1" /> Mark shipped
                      </Button>
                    </>
                  )}
                  {row.shipping_status === "shipped" && (
                    <Button variant="secondary" onClick={() => markDelivered(row)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Mark delivered
                    </Button>
                  )}
                  {row.shipping_status === "delivered" && (
                    <div className="text-sm text-emerald-600 flex items-center gap-1">
                      <Package className="h-4 w-4" /> Delivered
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
