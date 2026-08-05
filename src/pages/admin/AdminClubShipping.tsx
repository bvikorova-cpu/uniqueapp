import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Truck, CheckCircle2, Package, Copy, CreditCard, Users } from "lucide-react";

interface MemberRow {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  member_number: number;
  tier: "digital" | "physical";
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
  current_period_end: string | null;
}

interface Counts {
  total: number;
  digital: number;
  physical: number;
  pending_shipping: number;
}

type Filter = "all" | "digital" | "physical" | "to_ship";

function addressLines(row: MemberRow) {
  const a = row.shipping_address?.address ?? row.shipping_address ?? {};
  return {
    line1: a.line1 ?? null,
    line2: a.line2 ?? null,
    postal_code: a.postal_code ?? null,
    city: a.city ?? null,
    state: a.state ?? null,
    country: a.country ?? null,
    oneLine: [a.line1, a.line2, a.postal_code, a.city, a.state, a.country]
      .filter(Boolean)
      .join(", ") };
}

export default function AdminClubShipping() {
  const { toast } = useToast();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [tracking, setTracking] = useState<Record<string, string>>({});

  const load = async (nextFilter: Filter = filter) => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = { action: "admin_list_members" };
      if (nextFilter === "digital" || nextFilter === "physical") body.tier = nextFilter;
      if (nextFilter === "to_ship") {
        body.tier = "physical";
        body.shippingStatus = ["pending"];
      }
      const { data, error } = await supabase.functions.invoke("check-club-status", { body });
      if (error) throw error;
      setRows(((data as any)?.items ?? []) as MemberRow[]);
      setCounts(((data as any)?.counts ?? null) as Counts | null);
    } catch (e) {
      toast({ title: "Load failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); /* eslint-disable-next-line */ }, [filter]);

  const markShipped = async (row: MemberRow) => {
    try {
      const t = (tracking[row.id] ?? "").trim();
      const { error } = await supabase.functions.invoke("admin-club-shipping", {
        body: { action: "mark_shipped", membershipId: row.id, trackingNumber: t || null } });
      if (error) throw error;
      toast({ title: "Marked as shipped" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const markDelivered = async (row: MemberRow) => {
    try {
      const { error } = await supabase.functions.invoke("admin-club-shipping", {
        body: { action: "mark_delivered", membershipId: row.id } });
      if (error) throw error;
      toast({ title: "Marked as delivered" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const copyAddress = (row: MemberRow) => {
    const a = addressLines(row);
    const text = [
      row.recipient_name ?? row.user_name ?? "",
      a.line1,
      a.line2,
      [a.postal_code, a.city].filter(Boolean).join(" "),
      a.state,
      a.country,
      row.phone ? `Tel: ${row.phone}` : null,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Shipping address copied" });
  };

  const q = search.trim().toLowerCase();
  const visible = q
    ? rows.filter((r) =>
        [r.user_email, r.user_name, r.recipient_name, r.phone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
    : rows;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-black">VIP Club — Members & Card Delivery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every member, which card they bought, and the full delivery details for physical cards.
        </p>
      </div>

      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Shown</div>
            <div className="text-2xl font-black">{counts.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> Digital</div>
            <div className="text-2xl font-black">{counts.digital}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Physical</div>
            <div className="text-2xl font-black">{counts.physical}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> To ship</div>
            <div className="text-2xl font-black">{counts.pending_shipping}</div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {([
          ["all", "All members"],
          ["digital", "Digital"],
          ["physical", "Physical"],
          ["to_ship", "To ship"],
        ] as [Filter, string][]).map(([f, label]) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {label}
          </Button>
        ))}
        <Input
          placeholder="Search email, name, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-72"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No members match this view.</Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((row) => {
            const a = addressLines(row);
            return (
              <Card key={row.id} className="p-4 grid md:grid-cols-[1fr_auto] gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={row.tier === "physical" ? "bg-amber-500 text-white" : "bg-purple-500 text-white"}>
                      {row.tier === "physical" ? "PHYSICAL CARD" : "DIGITAL CARD"}
                    </Badge>
                    <Badge variant="outline">{row.status}</Badge>
                    {row.tier === "physical" && <Badge variant="secondary">{row.shipping_status}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(row.started_at).toLocaleDateString()}
                      {row.current_period_end
                        ? ` · renews ${new Date(row.current_period_end).toLocaleDateString()}`
                        : ""}
                    </span>
                  </div>

                  <div className="text-sm space-y-0.5">
                    <div><strong>Member:</strong> {row.user_name ?? "—"}</div>
                    <div><strong>Email:</strong> {row.user_email ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">User ID: <code>{row.user_id}</code></div>
                  </div>

                  {row.tier === "physical" && (
                    <div className="text-sm rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-0.5">
                      <div className="font-semibold mb-1">Delivery details</div>
                      <div><strong>Recipient:</strong> {row.recipient_name ?? row.user_name ?? "—"}</div>
                      <div><strong>Phone:</strong> {row.phone ?? "—"}</div>
                      <div><strong>Street:</strong> {[a.line1, a.line2].filter(Boolean).join(", ") || "—"}</div>
                      <div><strong>Postal code / city:</strong> {[a.postal_code, a.city].filter(Boolean).join(" ") || "—"}</div>
                      <div><strong>Region:</strong> {a.state ?? "—"}</div>
                      <div><strong>Country:</strong> {a.country ?? "—"}</div>
                      {row.shipping_note && <div><strong>Note:</strong> {row.shipping_note}</div>}
                      {row.tracking_number && <div><strong>Tracking:</strong> <code>{row.tracking_number}</code></div>}
                      {row.shipped_at && <div className="text-xs text-muted-foreground">Shipped {new Date(row.shipped_at).toLocaleString()}</div>}
                      {row.delivered_at && <div className="text-xs text-muted-foreground">Delivered {new Date(row.delivered_at).toLocaleString()}</div>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:w-64">
                  {row.tier === "physical" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => copyAddress(row)} disabled={!a.oneLine}>
                        <Copy className="h-4 w-4 mr-1" /> Copy address
                      </Button>
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
                    </>
                  )}
                  {row.tier === "digital" && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> No shipping needed
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
