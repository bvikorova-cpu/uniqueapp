import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, RefreshCw, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportToCsv } from "@/lib/exportCsv";

interface BoostRow {
  kind: string;
  entity_id: string;
  title: string | null;
  owner_id: string;
  owner_name: string | null;
  featured_at: string | null;
  featured_until: string | null;
  is_active_boost: boolean;
  credits_spent: number;
}

const KINDS = ["bazaar", "auction", "coupon", "course", "skills"] as const;

export default function AdminLaunchBoosts() {
  const [rows, setRows] = useState<BoostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("admin_launch_boosts_overview");
    if (error) {
      toast.error("Failed to load launch boosts: " + error.message);
    } else {
      setRows((data ?? []) as BoostRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (statusFilter === "active" && !r.is_active_boost) return false;
      if (statusFilter === "expired" && r.is_active_boost) return false;
      if (q) {
        const hay = `${r.title ?? ""} ${r.owner_name ?? ""} ${r.owner_id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, kindFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const active = filtered.filter((r) => r.is_active_boost).length;
    const credits = filtered.reduce((s, r) => s + (r.credits_spent || 0), 0);
    return {
      total: filtered.length,
      active,
      expired: filtered.length - active,
      credits,
      eur: (credits * 0.5).toFixed(2),
    };
  }, [filtered]);

  const perKind = useMemo(
    () =>
      KINDS.map((k) => {
        const list = filtered.filter((r) => r.kind === k);
        return {
          kind: k,
          total: list.length,
          active: list.filter((r) => r.is_active_boost).length,
          credits: list.reduce((s, r) => s + (r.credits_spent || 0), 0),
        };
      }),
    [filtered],
  );

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          icon={Rocket}
          title="Launch Boosts"
          subtitle="One-time 30-day TOP boosts (10 credits / €5) across Bazaar, Auctions, Coupons, Courses and Skills."
        />

        <div className="adm-lb-stats grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Boosts total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Active now</div>
            <div className="text-2xl font-bold text-primary">{stats.active}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Expired</div>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Credits spent</div>
            <div className="text-2xl font-bold">{stats.credits}</div>
            <div className="text-xs text-muted-foreground">≈ €{stats.eur}</div>
          </AdminGlassCard>
        </div>

        <AdminGlassCard className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Search (title, owner)</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="title, name or user_id..."
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Section</label>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {KINDS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              disabled={!filtered.length}
              onClick={() =>
                exportToCsv("launch-boosts", filtered, [
                  { key: "kind", label: "section" },
                  { key: "title", label: "title" },
                  { key: "owner_name", label: "owner" },
                  { key: "owner_id", label: "owner_id" },
                  { key: "featured_at", label: "boosted_at" },
                  { key: "featured_until", label: "expires_at" },
                  { key: "is_active_boost", label: "active" },
                  { key: "credits_spent", label: "credits_spent" },
                ])
              }
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </AdminGlassCard>

        <AdminGlassCard className="p-4 mb-4">
          <div className="text-sm font-semibold mb-3">By section</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {perKind.map((k) => (
              <div key={k.kind} className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.kind}</div>
                <div className="text-lg font-bold">{k.active} active</div>
                <div className="text-xs text-muted-foreground">
                  {k.total} total · {k.credits} credits
                </div>
              </div>
            ))}
          </div>
        </AdminGlassCard>

        <AdminGlassCard className="p-0 overflow-x-auto">
          <table className="adm-lb-table w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="p-3">Section</th>
                <th className="p-3">Item</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Boosted</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Credits</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && !filtered.length && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No launch boosts yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={`${r.kind}-${r.entity_id}`} className="border-b border-border/50">
                  <td className="p-3"><Badge variant="outline">{r.kind}</Badge></td>
                  <td className="p-3 max-w-[280px] truncate">{r.title || "—"}</td>
                  <td className="p-3">
                    <div>{r.owner_name || "—"}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.owner_id.slice(0, 8)}…</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.featured_at ? format(new Date(r.featured_at), "dd.MM.yyyy HH:mm") : "—"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.featured_until ? format(new Date(r.featured_until), "dd.MM.yyyy HH:mm") : "—"}
                  </td>
                  <td className="p-3">
                    {r.is_active_boost ? (
                      <Badge className="bg-primary text-primary-foreground">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Expired</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right font-semibold">{r.credits_spent || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
