import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, RefreshCw, Download, Truck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportToCsv } from "@/lib/exportCsv";

interface Row {
  id: string; user_id: string; package: string; language: string; full_name: string; address_line: string;
  city: string; postal_code: string; country: string; phone: string | null; email: string | null; note: string | null;
  credits_paid: number; status: string; tracking_number: string | null; shipped_at: string | null; created_at: string;
}

export default function AdminBookPreorders() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("kids_book_preorders").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load: " + error.message);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => status === "all" || r.status === status), [rows, status]);
  const pending = rows.filter((r) => r.status === "pending").length;

  const setRowStatus = async (r: Row, s: string) => {
    setBusyId(r.id);
    const { error } = await (supabase as any).rpc("admin_kids_book_preorder_set_status", { _id: r.id, _status: s, _tracking: tracking[r.id] ?? "" });
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(s === "shipped" ? "Marked as shipped — customer notified" : "Status updated");
    load();
  };

  return (
    <AdminPageShell>
      <AdminPageHeader title="Book Preorders" subtitle="Printed Learning Encyclopedia preorders and mega bundles" icon={Package} />
      <AdminGlassCard>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Total: {rows.length}</Badge>
          <Badge>Pending: {pending}</Badge>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCsv("book-preorders.csv", filtered as any)}><Download className="h-4 w-4" />CSV</Button>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No preorders yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={r.package === "mega" ? "default" : "secondary"}>{r.package === "mega" ? "Mega bundle" : "Printed book"}</Badge>
                  <Badge variant="outline">{r.language}</Badge>
                  <Badge variant={r.status === "shipped" ? "default" : r.status === "cancelled" ? "destructive" : "secondary"}>{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "dd.MM.yyyy HH:mm")} · {r.credits_paid} credits (€{(r.credits_paid / 2).toFixed(2)})</span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-semibold">{r.full_name}</div>
                  <div>{r.address_line}, {r.postal_code} {r.city}, {r.country}</div>
                  <div className="text-muted-foreground">{[r.phone, r.email].filter(Boolean).join(" · ")}</div>
                  {r.note && <div className="mt-1 italic text-muted-foreground">“{r.note}”</div>}
                  {r.tracking_number && <div className="mt-1">Tracking: {r.tracking_number}</div>}
                  {r.shipped_at && <div className="text-xs text-muted-foreground">Shipped {format(new Date(r.shipped_at), "dd.MM.yyyy")}</div>}
                </div>
                {r.status === "pending" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Input className="max-w-xs" placeholder="Tracking number (optional)" value={tracking[r.id] ?? ""} onChange={(e) => setTracking((p) => ({ ...p, [r.id]: e.target.value }))} />
                    <Button size="sm" className="gap-2" disabled={busyId === r.id} onClick={() => setRowStatus(r, "shipped")}><Truck className="h-4 w-4" />Mark shipped & notify</Button>
                    <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => setRowStatus(r, "cancelled")}>Cancel</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminGlassCard>
    </AdminPageShell>
  );
}
