import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Loader2, Check, X, Flag, EyeOff, Eye, Gavel, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type JudgeApp = { id: string; user_id: string; motivation: string; status: string; created_at: string; review_notes: string | null };
type Report = { id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string; created_at: string; resolution_notes: string | null };
type Comment = { id: string; submission_id: string; user_id: string; comment_text: string; created_at: string; hidden: boolean; hidden_reason: string | null };

const AdminMegatalentModeration = () => {
  const [tab, setTab] = useState("judges");
  const [judges, setJudges] = useState<JudgeApp[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null }>>({});
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"open" | "all">("open");

  const loadJudges = async () => {
    const { data } = await (supabase as any).from("judge_applications")
      .select("*").order("created_at", { ascending: false }).limit(200);
    setJudges((data as JudgeApp[]) || []);
    hydrateProfiles((data || []).map((a: any) => a.user_id));
  };

  const loadReports = async () => {
    let q = (supabase as any).from("talent_reports").select("*").order("created_at", { ascending: false }).limit(200);
    if (statusFilter === "open") q = q.eq("status", "open");
    const { data } = await q;
    setReports((data as Report[]) || []);
    hydrateProfiles((data || []).map((r: any) => r.reporter_id));
  };

  const loadComments = async () => {
    const { data } = await (supabase as any).from("talent_comments")
      .select("*").order("created_at", { ascending: false }).limit(100);
    setComments((data as Comment[]) || []);
    hydrateProfiles((data || []).map((c: any) => c.user_id));
  };

  const hydrateProfiles = async (ids: string[]) => {
    const uniq = Array.from(new Set(ids.filter(Boolean)));
    const missing = uniq.filter(i => !profiles[i]);
    if (!missing.length) return;
    const { data } = await (supabase as any).from("profiles_public").select("id,full_name,avatar_url").in("id", missing);
    if (data) {
      const map: any = {};
      data.forEach((p: any) => { map[p.id] = p; });
      setProfiles(prev => ({ ...prev, ...map }));
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      if (tab === "judges") await loadJudges();
      else if (tab === "reports") await loadReports();
      else await loadComments();
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); /* eslint-disable-line */ }, [tab, statusFilter]);

  const approveJudge = async (id: string, notes?: string) => {
    try {
      const { error } = await (supabase as any).rpc("approve_judge_application", { _app_id: id, _notes: notes || null });
      if (error) throw error;
      toast.success("Judge approved");
      await loadJudges();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const rejectJudge = async (id: string, notes: string) => {
    try {
      const { error } = await (supabase as any).rpc("reject_judge_application", { _app_id: id, _notes: notes || null });
      if (error) throw error;
      toast.success("Application rejected");
      await loadJudges();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const moderateComment = async (id: string, hide: boolean, reason?: string) => {
    try {
      const { error } = await (supabase as any).rpc("moderate_comment", { _comment_id: id, _hide: hide, _reason: reason || null });
      if (error) throw error;
      toast.success(hide ? "Comment hidden" : "Comment restored");
      await loadComments();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const resolveReport = async (id: string, status: "resolved" | "dismissed", notes: string) => {
    try {
      const { error } = await (supabase as any).rpc("resolve_report", { _report_id: id, _status: status, _notes: notes || null });
      if (error) throw error;
      toast.success(`Report ${status}`);
      await loadReports();
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader icon={Shield} title="Megatalent Moderation" subtitle="Judge applications, comment moderation & reports" />

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="judges" className="gap-1"><Gavel className="h-3.5 w-3.5" /> Judges</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1"><Flag className="h-3.5 w-3.5" /> Reports</TabsTrigger>
              <TabsTrigger value="comments" className="gap-1"><EyeOff className="h-3.5 w-3.5" /> Comments</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              {tab === "reports" && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter(s => s === "open" ? "all" : "open")}>
                  {statusFilter === "open" ? "Showing: Open" : "Showing: All"}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="gap-1">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
              </Button>
            </div>
          </div>

          {/* JUDGES */}
          <TabsContent value="judges">
            <AdminGlassCard className="p-4 space-y-3">
              {judges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No judge applications yet.</p>
              ) : judges.map(j => {
                const p = profiles[j.user_id];
                return (
                  <div key={j.id} className="rounded-lg border border-border/30 bg-background/40 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p?.full_name || j.user_id.slice(0, 8)}</span>
                        <Badge variant={j.status === "approved" ? "default" : j.status === "rejected" ? "destructive" : "secondary"}>{j.status}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(j.created_at), "PP p")}</span>
                    </div>
                    <p className="text-sm italic text-muted-foreground">"{j.motivation}"</p>
                    {j.review_notes && <p className="text-xs">Note: {j.review_notes}</p>}
                    {j.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => approveJudge(j.id)} className="gap-1 bg-green-600 hover:bg-green-700">
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <RejectDialog onConfirm={(notes) => rejectJudge(j.id, notes)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </AdminGlassCard>
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports">
            <AdminGlassCard className="p-4 space-y-3">
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No {statusFilter === "open" ? "open" : ""} reports.</p>
              ) : reports.map(r => {
                const p = profiles[r.reporter_id];
                return (
                  <div key={r.id} className="rounded-lg border border-border/30 bg-background/40 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 text-destructive" />
                        <Badge variant="outline">{r.target_type}</Badge>
                        <Badge variant="secondary">{r.reason.replace("_", " ")}</Badge>
                        <Badge variant={r.status === "open" ? "destructive" : "secondary"}>{r.status}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "PP p")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reporter: {p?.full_name || r.reporter_id.slice(0, 8)} · Target ID: <code className="text-[10px]">{r.target_id.slice(0, 8)}</code>
                    </div>
                    {r.details && <p className="text-sm italic">"{r.details}"</p>}
                    {r.resolution_notes && <p className="text-xs text-green-400">Resolved: {r.resolution_notes}</p>}
                    {r.status === "open" && (
                      <div className="flex gap-2 pt-1">
                        <ResolveDialog onConfirm={(notes) => resolveReport(r.id, "resolved", notes)} label="Resolve" variant="default" />
                        <ResolveDialog onConfirm={(notes) => resolveReport(r.id, "dismissed", notes)} label="Dismiss" variant="ghost" />
                      </div>
                    )}
                  </div>
                );
              })}
            </AdminGlassCard>
          </TabsContent>

          {/* COMMENTS */}
          <TabsContent value="comments">
            <AdminGlassCard className="p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No comments.</p>
              ) : comments.map(c => {
                const p = profiles[c.user_id];
                return (
                  <div key={c.id} className={`rounded-lg border p-3 space-y-2 ${c.hidden ? "border-destructive/40 bg-destructive/5" : "border-border/30 bg-background/40"}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p?.full_name || c.user_id.slice(0, 8)}</span>
                        {c.hidden && <Badge variant="destructive" className="gap-1"><EyeOff className="h-3 w-3" /> hidden</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "PP p")}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{c.comment_text}</p>
                    {c.hidden_reason && <p className="text-xs text-muted-foreground">Reason: {c.hidden_reason}</p>}
                    <div className="flex gap-2 pt-1">
                      {c.hidden ? (
                        <Button size="sm" variant="outline" onClick={() => moderateComment(c.id, false)} className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> Restore
                        </Button>
                      ) : (
                        <ResolveDialog onConfirm={(notes) => moderateComment(c.id, true, notes)} label="Hide" variant="destructive" placeholder="Why hide this comment?" />
                      )}
                    </div>
                  </div>
                );
              })}
            </AdminGlassCard>
          </TabsContent>
        </Tabs>
      </AdminPageShell>
    </AdminGuard>
  );
};

const RejectDialog = ({ onConfirm }: { onConfirm: (notes: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1"><X className="h-3.5 w-3.5" /> Reject</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reject application</DialogTitle></DialogHeader>
        <Textarea value={notes} onChange={e => setNotes(e.target.value.slice(0, 300))} placeholder="Reason (optional)" className="min-h-[80px]" />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={() => { onConfirm(notes); setOpen(false); setNotes(""); }}>Reject</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ResolveDialog = ({ onConfirm, label, variant, placeholder }: { onConfirm: (notes: string) => void; label: string; variant: any; placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={variant}>{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
        <Textarea value={notes} onChange={e => setNotes(e.target.value.slice(0, 300))} placeholder={placeholder || "Notes (optional)"} className="min-h-[80px]" />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" variant={variant} onClick={() => { onConfirm(notes); setOpen(false); setNotes(""); }}>{label}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminMegatalentModeration;
