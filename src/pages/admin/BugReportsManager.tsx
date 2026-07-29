import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from "@/components/ui/table";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bug, CheckCircle2, Gift, Loader2, RefreshCw, Send } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDistanceToNow } from "date-fns";

type Severity = "minor" | "major" | "critical";
type Status = "new" | "triage" | "confirmed" | "rejected" | "duplicate" | "fixed";

interface BugReport {
  id: string;
  user_id: string | null;
  email: string | null;
  title: string;
  description: string;
  steps: string | null;
  page_url: string | null;
  severity: Severity;
  status: Status;
  admin_notes: string | null;
  response_message: string | null;
  response_at: string | null;
  rewarded: boolean;
  reward_amount: number;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_COLORS: Record<Status, string> = { new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  triage: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  duplicate: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  fixed: "bg-primary/10 text-primary border-primary/20" };

const SEVERITY_COLORS: Record<Severity, string> = { minor: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  major: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20" };

export default function BugReportsManager() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [selected, setSelected] = useState<BugReport | null>(null);
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    const rows = (data ?? []) as BugReport[];
    setReports(rows);

    const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = p.full_name || p.username || "";
      });
      setProfileNames(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (filterStatus === "all" || r.status === filterStatus) &&
          (filterSeverity === "all" || r.severity === filterSeverity)
      ),
    [reports, filterStatus, filterSeverity]
  );

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) =>
      ["new", "triage"].includes(r.status)
    ).length;
    const confirmed = reports.filter((r) => r.status === "confirmed").length;
    const rewarded = reports.filter((r) => r.rewarded).length;
    const creditsPaid = reports.reduce((s, r) => s + (r.reward_amount || 0), 0);
    const responded = reports.filter((r) => r.response_message).length;
    return { total, pending, confirmed, rewarded, creditsPaid, responded };
  }, [reports]);

  const updateStatus = async (id: string, status: Status) => { setSaving(id);
    const patch: Partial<BugReport> = {
      status,
      admin_notes: selected?.id === id ? notes || null : undefined };
    const { error } = await supabase
      .from("bug_reports")
      .update(patch)
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      status === "confirmed"
        ? "Confirmed — credits granted automatically."
        : `Status set to ${status}`
    );
    await load();
    setSelected(null);
  };

  const sendResponse = async () => {
    if (!selected || !response.trim()) return;
    setSendingResponse(true);
    const { error } = await supabase
      .from("bug_reports")
      .update({
        response_message: response.trim(),
        response_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSendingResponse(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reply sent — user will receive a notification.");
    setResponse("");
    await load();
    setSelected(null);
  };

  const reporterName = (r: BugReport) =>
    r.user_id ? profileNames[r.user_id] || r.email || r.user_id.slice(0, 8) : r.email || "Anonymous";

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Bug reports"
          subtitle="Review beta tester submissions. Confirming a report auto-grants AI credits. Send replies to notify reporters."
          icon={Bug}
        />

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Confirmed</div>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Rewarded</div>
            <div className="text-2xl font-bold">{stats.rewarded}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Responded</div>
            <div className="text-2xl font-bold">{stats.responded}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Credits paid</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Gift className="h-5 w-5 text-primary" />
              {stats.creditsPaid}
            </div>
          </Card>
        </div>

        <Card className="p-4 flex flex-wrap gap-3 items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as Status | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="triage">Triage</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <Select value={filterSeverity} onValueChange={(v) => setFilterSeverity(v as Severity | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <AdminGlassCard>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No bug reports match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-xs">
                        <div className="font-medium truncate">{r.title}</div>
                        {r.page_url && (
                          <div className="text-xs text-muted-foreground truncate">
                            {r.page_url}
                          </div>
                        )}
                        {r.response_message && (
                          <Badge variant="outline" className="mt-1 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Replied
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={SEVERITY_COLORS[r.severity]}>
                          {r.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[r.status]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.rewarded ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />+{r.reward_amount}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {reporterName(r)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={selected?.id === r.id}
                          onOpenChange={(o) => {
                            if (o) {
                              setSelected(r);
                              setNotes(r.admin_notes ?? "");
                              setResponse(r.response_message ?? "");
                            } else {
                              setSelected(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Review</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{r.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className={SEVERITY_COLORS[r.severity]}>
                                  {r.severity}
                                </Badge>
                                <Badge variant="outline" className={STATUS_COLORS[r.status]}>
                                  {r.status}
                                </Badge>
                                {r.rewarded && (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                                    <Gift className="h-3 w-3 mr-1" />
                                    Rewarded +{r.reward_amount}
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Reporter</div>
                                <div className="text-sm font-medium">{reporterName(r)}</div>
                                {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Description</div>
                                <div className="text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-3">
                                  {r.description}
                                </div>
                              </div>
                              {r.steps && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Steps</div>
                                  <div className="text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-3">
                                    {r.steps}
                                  </div>
                                </div>
                              )}
                              {r.page_url && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Page: </span>
                                  <a href={r.page_url} target="_blank" rel="noreferrer" className="text-primary underline">
                                    {r.page_url}
                                  </a>
                                </div>
                              )}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Admin notes</div>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={2}
                                  placeholder="Internal notes about this report..."
                                />
                              </div>
                              {r.response_message && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Sent reply</div>
                                  <div className="text-sm whitespace-pre-wrap rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
                                    {r.response_message}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-1">
                                    {r.response_at && formatDistanceToNow(new Date(r.response_at), { addSuffix: true })}
                                  </div>
                                </div>
                              )}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Reply to reporter</div>
                                <Textarea
                                  value={response}
                                  onChange={(e) => setResponse(e.target.value)}
                                  rows={3}
                                  placeholder="Type a response the user will see in their notifications..."
                                />
                                <div className="flex justify-end mt-2">
                                  <Button
                                    size="sm"
                                    onClick={sendResponse}
                                    disabled={sendingResponse || !response.trim()}
                                  >
                                    {sendingResponse ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Send reply
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={saving === r.id}
                                  onClick={() => updateStatus(r.id, "triage")}
                                >
                                  Triage
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={saving === r.id || r.rewarded}
                                  onClick={() => updateStatus(r.id, "confirmed")}
                                >
                                  Confirm & reward
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={saving === r.id}
                                  onClick={() => updateStatus(r.id, "fixed")}
                                >
                                  Mark fixed
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={saving === r.id}
                                  onClick={() => updateStatus(r.id, "duplicate")}
                                >
                                  Duplicate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={saving === r.id}
                                  onClick={() => updateStatus(r.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
