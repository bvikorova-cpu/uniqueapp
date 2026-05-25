import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Loader2, Check, X, RefreshCw, Euro } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type Tournament = { id: string; category: string; status: string; ends_at: string; prize_amount_cents: number; champion_participant_id: string | null };
type Payout = { id: string; campaign_id: string; owner_user_id: string; amount_cents: number; status: string; created_at: string; completed_at: string | null; failure_reason: string | null };

const AdminBattleRoyalePayouts = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [editingPrize, setEditingPrize] = useState<string | null>(null);
  const [prizeInput, setPrizeInput] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data: t } = await (supabase as any).from("battle_royale_tournaments")
        .select("id, category, status, ends_at, prize_amount_cents, champion_participant_id")
        .order("ends_at", { ascending: false }).limit(50);
      setTournaments((t as Tournament[]) || []);

      const { data: p } = await supabase.from("campaign_payouts")
        .select("id, campaign_id, owner_user_id, amount_cents, status, created_at, completed_at, failure_reason")
        .eq("campaign_type", "battle_royale")
        .order("created_at", { ascending: false }).limit(100);
      setPayouts((p as Payout[]) || []);

      const uids = Array.from(new Set((p || []).map((x: any) => x.owner_user_id)));
      if (uids.length) {
        const { data: profs } = await supabase.from("profiles_public" as any).select("id,full_name,avatar_url").in("id", uids);
        const map: any = {};
        (profs || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const savePrize = async (tid: string) => {
    const eur = parseFloat(prizeInput);
    if (isNaN(eur) || eur < 0) { toast.error("Invalid amount"); return; }
    const cents = Math.round(eur * 100);
    try {
      const { error } = await (supabase as any).from("battle_royale_tournaments").update({ prize_amount_cents: cents }).eq("id", tid);
      if (error) throw error;
      toast.success("Prize updated");
      setEditingPrize(null); setPrizeInput("");
      await load();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const decide = async (id: string, action: "approve" | "reject", rejection_reason?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-approve-campaign-payout", {
        body: { payout_id: id, action, rejection_reason },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(action === "approve" ? "Transfer sent via Stripe" : "Payout rejected");
      await load();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const pending = payouts.filter(p => p.status === "pending_review");
  const recent = payouts.filter(p => p.status !== "pending_review");

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader icon={Trophy} title="Battle Royale Payouts" subtitle="Set prize amounts & approve winner payouts via Stripe Connect" />

        <div className="flex justify-end mb-3">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
          </Button>
        </div>

        <AdminGlassCard className="p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Euro className="h-4 w-4" /> Pending review ({pending.length})</h3>
          {pending.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No pending payouts.</p> : pending.map(p => {
            const profile = profiles[p.owner_user_id];
            return (
              <div key={p.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-2 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm font-semibold">{profile?.full_name || p.owner_user_id.slice(0, 8)} · €{(p.amount_cents / 100).toFixed(2)}</div>
                  <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "PP p")}</span>
                </div>
                <div className="text-xs text-muted-foreground">Tournament: <code>{p.campaign_id.slice(0, 8)}…</code></div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(p.id, "approve")} className="gap-1 bg-green-600 hover:bg-green-700">
                    <Check className="h-3.5 w-3.5" /> Approve & transfer
                  </Button>
                  <RejectDialog onConfirm={(reason) => decide(p.id, "reject", reason)} />
                </div>
              </div>
            );
          })}
        </AdminGlassCard>

        <AdminGlassCard className="p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4" /> Completed tournaments — set prize</h3>
          {tournaments.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No tournaments.</p> : tournaments.map(t => (
            <div key={t.id} className="flex items-center justify-between flex-wrap gap-2 rounded border border-border/30 bg-background/40 p-2.5 mb-2">
              <div className="text-sm">
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="mr-2">{t.status}</Badge>
                <span className="font-mono text-xs">{t.id.slice(0, 8)}</span> · {t.category}
                {t.champion_participant_id && <Badge variant="outline" className="ml-2 text-[10px]">has champion</Badge>}
              </div>
              {editingPrize === t.id ? (
                <div className="flex items-center gap-1">
                  <Input type="number" step="0.01" value={prizeInput} onChange={e => setPrizeInput(e.target.value)} className="h-8 w-24 text-xs" placeholder="EUR" />
                  <Button size="sm" onClick={() => savePrize(t.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingPrize(null)}>Cancel</Button>
                </div>
              ) : (
                <button onClick={() => { setEditingPrize(t.id); setPrizeInput(((t.prize_amount_cents || 0) / 100).toString()); }}
                  className="text-xs font-mono px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 transition">
                  €{((t.prize_amount_cents || 0) / 100).toFixed(2)}
                </button>
              )}
            </div>
          ))}
        </AdminGlassCard>

        <AdminGlassCard className="p-4">
          <h3 className="font-semibold mb-3">Recent payouts</h3>
          {recent.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No payouts yet.</p> : recent.map(p => {
            const profile = profiles[p.owner_user_id];
            return (
              <div key={p.id} className="flex items-center justify-between text-xs rounded border border-border/30 bg-background/30 px-2.5 py-1.5 mb-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "completed" ? "default" : p.status === "failed" || p.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{p.status}</Badge>
                  <span>{profile?.full_name || p.owner_user_id.slice(0, 8)}</span>
                  <span className="font-mono">€{(p.amount_cents / 100).toFixed(2)}</span>
                </div>
                <span className="text-muted-foreground">{format(new Date(p.created_at), "PP")}</span>
              </div>
            );
          })}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
};

const RejectDialog = ({ onConfirm }: { onConfirm: (reason: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1"><X className="h-3.5 w-3.5" /> Reject</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reject payout</DialogTitle></DialogHeader>
        <Textarea value={reason} onChange={e => setReason(e.target.value.slice(0, 300))} placeholder="Reason (min 5 chars)" className="min-h-[80px]" />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" variant="destructive" disabled={reason.trim().length < 5} onClick={() => { onConfirm(reason); setOpen(false); setReason(""); }}>Reject</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBattleRoyalePayouts;
