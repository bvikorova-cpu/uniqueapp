import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2, Search, Shield, ExternalLink } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DisputeRow {
  id: string;
  stripe_dispute_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  reason: string | null;
  status: string;
  evidence_due_by: string | null;
  evidence: any;
  evidence_submitted_at: string | null;
  resolution: string | null;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_VARIANTS: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  warning_needs_response: "destructive",
  warning_under_review: "secondary",
  warning_closed: "outline",
  needs_response: "destructive",
  under_review: "secondary",
  charge_refunded: "outline",
  won: "default",
  lost: "destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"} className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function EvidenceDialog({
  dispute,
  onClose,
  onSaved,
}: {
  dispute: DisputeRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ev = dispute.evidence ?? {};
  const [productDescription, setProductDescription] = useState(ev.product_description ?? "");
  const [customerCommunication, setCustomerCommunication] = useState(
    ev.customer_communication ?? "",
  );
  const [serviceDate, setServiceDate] = useState(ev.service_date ?? "");
  const [shippingTracking, setShippingTracking] = useState(ev.shipping_tracking_number ?? "");
  const [refundPolicy, setRefundPolicy] = useState(ev.refund_policy ?? "");
  const [uncategorized, setUncategorized] = useState(ev.uncategorized_text ?? "");
  const [adminNotes, setAdminNotes] = useState(dispute.admin_notes ?? "");
  const [busy, setBusy] = useState(false);

  const buildEvidence = () => ({
    product_description: productDescription || undefined,
    customer_communication: customerCommunication || undefined,
    service_date: serviceDate || undefined,
    shipping_tracking_number: shippingTracking || undefined,
    refund_policy: refundPolicy || undefined,
    uncategorized_text: uncategorized || undefined,
  });

  const save = async (submit: boolean) => {
    setBusy(true);
    try {
      // Persist admin_notes locally
      await supabase
        .from("stripe_disputes")
        .update({ admin_notes: adminNotes })
        .eq("id", dispute.id);

      const { data, error } = await supabase.functions.invoke(
        "admin-submit-dispute-evidence",
        { body: { disputeId: dispute.id, evidence: buildEvidence(), submit } },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast.success(submit ? "Evidence submitted to Stripe" : "Evidence staged");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error("Failed to save evidence", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispute evidence — {dispute.stripe_dispute_id}
          </DialogTitle>
          <DialogDescription>
            Reason: <strong>{dispute.reason ?? "unknown"}</strong> · Amount:{" "}
            {(dispute.amount_cents / 100).toFixed(2)} {dispute.currency.toUpperCase()}
            {dispute.evidence_due_by && (
              <>
                {" "}
                · Due {formatDistanceToNow(new Date(dispute.evidence_due_by), { addSuffix: true })}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product description</label>
            <Textarea
              rows={3}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="What was sold / delivered?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer communication</label>
            <Textarea
              rows={4}
              value={customerCommunication}
              onChange={(e) => setCustomerCommunication(e.target.value)}
              placeholder="Paste relevant emails / chats with the customer."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service date</label>
              <Input
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping tracking #</label>
              <Input
                value={shippingTracking}
                onChange={(e) => setShippingTracking(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Refund / cancellation policy</label>
            <Textarea
              rows={2}
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional statement</label>
            <Textarea
              rows={3}
              value={uncategorized}
              onChange={(e) => setUncategorized(e.target.value)}
              placeholder="Any extra context for the bank reviewer."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Internal admin notes</label>
            <Textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Notes for our team only (not sent to Stripe)."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
          </Button>
          <Button onClick={() => save(true)} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit to Stripe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminDisputesInner() {
  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<DisputeRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stripe_disputes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.stripe_dispute_id.toLowerCase().includes(s) ||
      (r.stripe_payment_intent_id ?? "").toLowerCase().includes(s) ||
      (r.reason ?? "").toLowerCase().includes(s) ||
      r.status.toLowerCase().includes(s)
    );
  });

  const openCount = rows.filter(
    (r) => !["won", "lost", "warning_closed"].includes(r.status),
  ).length;
  const lostCount = rows.filter((r) => r.status === "lost").length;
  const wonCount = rows.filter((r) => r.status === "won").length;

  return (
    <AdminPageShell>
      <AdminPageHeader
        icon={AlertTriangle}
        title="Disputes & Chargebacks"
        subtitle="Stripe dispute lifecycle — submit evidence, track resolution"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AdminGlassCard className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Open</p>
          <p className="text-3xl font-bold text-destructive">{openCount}</p>
        </AdminGlassCard>
        <AdminGlassCard className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Won</p>
          <p className="text-3xl font-bold text-primary">{wonCount}</p>
        </AdminGlassCard>
        <AdminGlassCard className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Lost</p>
          <p className="text-3xl font-bold">{lostCount}</p>
        </AdminGlassCard>
      </div>

      <AdminGlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by dispute id, PI, reason, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" size="sm" onClick={load} className="ml-auto">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No disputes found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const resolved = ["won", "lost", "warning_closed"].includes(r.status);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">
                      {r.stripe_dispute_id}
                      {r.stripe_payment_intent_id && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${r.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 inline-flex items-center text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{r.reason?.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      {(r.amount_cents / 100).toFixed(2)} {r.currency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.evidence_due_by
                        ? formatDistanceToNow(new Date(r.evidence_due_by), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={resolved ? "outline" : "default"}
                        onClick={() => setActive(r)}
                      >
                        {resolved ? "View" : "Submit evidence"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </AdminGlassCard>

      {active && (
        <EvidenceDialog dispute={active} onClose={() => setActive(null)} onSaved={load} />
      )}
    </AdminPageShell>
  );
}

export default function AdminDisputes() {
  return (
    <AdminGuard>
      <AdminDisputesInner />
    </AdminGuard>
  );
}
