import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

type Row = {
  user_id: string;
  email: string;
  status: string;
  verified_name: string | null;
  verified_country: string | null;
  document_type: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  updated_at: string;
};

type Counts = {
  verified: number; pending: number; requires_input: number; rejected: number; unverified: number;
};

const StatusBadge = ({ s }: { s: string }) => {
  if (s === "verified") return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>;
  if (s === "pending") return <Badge className="bg-primary/15 text-primary border-primary/30 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
  if (s === "requires_input") return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 gap-1"><AlertTriangle className="h-3 w-3" />Action needed</Badge>;
  if (s === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
  return <Badge variant="outline">{s}</Badge>;
};

const AdminKYC = () => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideRow, setOverrideRow] = useState<Row | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<"verified" | "rejected">("verified");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-kyc");
    setLoading(false);
    if (error || (data as any)?.error) return;
    setCounts((data as any).counts);
    setRows((data as any).rows ?? []);
  };

  useEffect(() => { load(); }, []);

  const submitOverride = async () => {
    if (!overrideRow) return;
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke(
      "admin-kyc?action=override",
      { body: { user_id: overrideRow.user_id, status: overrideStatus, rejection_reason: reason } },
    );
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || "Override failed");
      return;
    }
    toast.success("KYC status updated");
    setOverrideRow(null);
    setReason("");
    load();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>Creator KYC Review — Admin</title>
        <meta name="description" content="Review creator identity verifications and manually override status when needed." />
      </Helmet>

      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> Creator KYC
          </h1>
          <p className="text-muted-foreground">Identity verification status across all creators.</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Verified</div>
            <div className="text-2xl font-bold text-emerald-500">{counts.verified}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-primary">{counts.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Action needed</div>
            <div className="text-2xl font-bold text-amber-500">{counts.requires_input}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-destructive">{counts.rejected}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Unverified</div>
            <div className="text-2xl font-bold">{counts.unverified}</div>
          </Card>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">Updated</th>
                <th className="p-3">Email</th>
                <th className="p-3">Verified name</th>
                <th className="p-3">Country</th>
                <th className="p-3">Doc</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reason</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-t border-border/50">
                  <td className="p-3 whitespace-nowrap">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.verified_name || "—"}</td>
                  <td className="p-3 uppercase">{r.verified_country || "—"}</td>
                  <td className="p-3">{r.document_type || "—"}</td>
                  <td className="p-3"><StatusBadge s={r.status} /></td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{r.rejection_reason || "—"}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => { setOverrideRow(r); setOverrideStatus("verified"); }}>
                      Override
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No creator verifications yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!overrideRow} onOpenChange={(o) => !o && setOverrideRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual KYC override</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">
              User: <span className="font-mono">{overrideRow?.email}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={overrideStatus === "verified" ? "default" : "outline"}
                onClick={() => setOverrideStatus("verified")}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant={overrideStatus === "rejected" ? "destructive" : "outline"}
                onClick={() => setOverrideStatus("rejected")}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
            <Textarea
              placeholder="Reason / internal note (optional for approve, required for reject)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOverrideRow(null)}>Cancel</Button>
            <Button
              onClick={submitOverride}
              disabled={submitting || (overrideStatus === "rejected" && !reason.trim())}
            >
              {submitting ? "Submitting..." : "Confirm override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYC;
