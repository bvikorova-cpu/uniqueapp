import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, CheckCircle2, XCircle, Clock, History, Search, Gavel, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDistanceToNow } from "date-fns";

type Brand = {
  id: string;
  name: string;
  logo: string;
  category: string;
  tier: string;
  description: string | null;
  website: string | null;
  user_id: string;
  subscription_status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_reason: string | null;
  moderated_at: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  brand_id: string;
  admin_id: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
  brand?: { name: string } | null;
};

type Appeal = {
  id: string;
  brand_id: string;
  user_id: string;
  status: "pending" | "under_review" | "accepted" | "dismissed";
  appeal_text: string;
  supporting_url: string | null;
  admin_response: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  brand?: { name: string; logo: string; moderation_reason: string | null } | null;
};

const STATUS_BADGE: Record<string, { label: string; variant: any; icon: any }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  under_review: { label: "Under review", variant: "secondary", icon: Gavel },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", variant: "destructive", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="gap-1">
      <Icon className="h-3 w-3" /> {s.label}
    </Badge>
  );
}

function ModerationActions({ brand }: { brand: Brand }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState(brand.moderation_reason ?? "");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const decide = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("brand_sponsors")
      .update({
        moderation_status: status,
        moderation_reason: status === "rejected" ? reason.trim() : null,
        moderated_by: u.user?.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", brand.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Brand ${status}`);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-brand-moderation"] });
    qc.invalidateQueries({ queryKey: ["admin-brand-audit"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`moderate-${brand.id}`}>Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Moderate brand: {brand.name}</DialogTitle>
          <DialogDescription>Category: {brand.category} · Tier: {brand.tier}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {brand.description && <p className="text-muted-foreground">{brand.description}</p>}
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noreferrer"
               className="text-primary underline break-all">{brand.website}</a>
          )}
          <Textarea
            placeholder="Rejection reason (required when rejecting)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            data-testid="moderation-reason"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" disabled={busy} onClick={() => decide("rejected")} data-testid="reject-brand">Reject</Button>
          <Button disabled={busy} onClick={() => decide("approved")} data-testid="approve-brand">Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QueueFilters({
  search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo, reason, setReason, showReason,
}: {
  search: string; setSearch: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  reason: string; setReason: (v: string) => void;
  showReason: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4" data-testid="queue-filters">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search brand name / category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
          data-testid="filter-search"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} data-testid="filter-date-from" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} data-testid="filter-date-to" />
      </div>
      {showReason && (
        <Input
          placeholder="Filter by rejection reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-testid="filter-reason"
        />
      )}
    </div>
  );
}

function QueueTable({ status }: { status: "pending" | "approved" | "rejected" }) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-brand-moderation", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("*")
        .eq("moderation_status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Brand[];
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const r = reason.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 86_400_000 : null;
    return data.filter((b) => {
      if (s && !`${b.name} ${b.category}`.toLowerCase().includes(s)) return false;
      if (r && !(b.moderation_reason ?? "").toLowerCase().includes(r)) return false;
      const t = new Date(b.created_at).getTime();
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [data, search, reason, dateFrom, dateTo]);

  return (
    <div>
      <QueueFilters
        search={search} setSearch={setSearch}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        reason={reason} setReason={setReason}
        showReason={status === "rejected"}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground" data-testid="empty-queue">
          No {status} brands match your filters.
        </p>
      ) : (
        <div className="space-y-3" data-testid={`queue-${status}`}>
          {filtered.map((b) => (
            <div key={b.id}
                 className="flex items-center gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
              <img src={b.logo} alt={b.name} className="h-12 w-12 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{b.name}</span>
                  <StatusBadge status={b.moderation_status} />
                  <span className="text-xs text-muted-foreground">{b.category} · {b.tier}</span>
                </div>
                {b.moderation_reason && (
                  <p className="mt-1 text-xs text-destructive">Reason: {b.moderation_reason}</p>
                )}
              </div>
              <ModerationActions brand={b} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AppealReviewActions({ appeal }: { appeal: Appeal }) {
  const qc = useQueryClient();
  const [response, setResponse] = useState(appeal.admin_response ?? "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const decide = async (status: "under_review" | "accepted" | "dismissed") => {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("brand_moderation_appeals")
      .update({
        status,
        admin_response: response.trim() || null,
        reviewed_by: u.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", appeal.id);

    // If accepted, re-approve the brand
    if (!error && status === "accepted") {
      await supabase
        .from("brand_sponsors")
        .update({
          moderation_status: "approved",
          moderation_reason: null,
          moderated_by: u.user?.id,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", appeal.brand_id);
    }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Appeal ${status}`);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-brand-appeals"] });
    qc.invalidateQueries({ queryKey: ["admin-brand-moderation"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`review-appeal-${appeal.id}`}>Review appeal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appeal: {appeal.brand?.name ?? appeal.brand_id}</DialogTitle>
          <DialogDescription>
            Original rejection reason: {appeal.brand?.moderation_reason ?? "—"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded border border-border/40 bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground mb-1">Brand owner says</p>
            <p>{appeal.appeal_text}</p>
            {appeal.supporting_url && (
              <a href={appeal.supporting_url} target="_blank" rel="noreferrer"
                 className="mt-2 inline-block text-primary underline break-all">
                Supporting link
              </a>
            )}
          </div>
          <Textarea
            placeholder="Admin response (optional)"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            data-testid="appeal-response"
          />
        </div>
        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="secondary" disabled={busy} onClick={() => decide("under_review")} data-testid="appeal-under-review">
            Mark under review
          </Button>
          <Button variant="destructive" disabled={busy} onClick={() => decide("dismissed")} data-testid="appeal-dismiss">
            Dismiss
          </Button>
          <Button disabled={busy} onClick={() => decide("accepted")} data-testid="appeal-accept">
            Accept & approve brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppealsQueue() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-brand-appeals"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("brand_moderation_appeals")
        .select("*, brand:brand_sponsors(name, logo, moderation_reason)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Appeal[];
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (s && !`${a.brand?.name ?? ""} ${a.appeal_text}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [data, statusFilter, search]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3 mb-4" data-testid="appeals-filters">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brand or appeal text" value={search}
                 onChange={(e) => setSearch(e.target.value)} className="pl-8"
                 data-testid="appeals-search" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="appeals-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground" data-testid="empty-appeals">No appeals match your filters.</p>
      ) : (
        <div className="space-y-3" data-testid="appeals-list">
          {filtered.map((a) => (
            <div key={a.id} className="flex items-start gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
              {a.brand?.logo && (
                <img src={a.brand.logo} alt={a.brand?.name ?? ""} className="h-12 w-12 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{a.brand?.name ?? a.brand_id}</span>
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm line-clamp-3">{a.appeal_text}</p>
                {a.admin_response && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <MessageSquare className="inline h-3 w-3 mr-1" />
                    {a.admin_response}
                  </p>
                )}
              </div>
              <AppealReviewActions appeal={a} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditLog() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-brand-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_moderation_audit")
        .select("*, brand:brand_sponsors(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AuditRow[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) {
    return <p className="text-sm text-muted-foreground" data-testid="empty-audit">No audit entries yet.</p>;
  }

  return (
    <div className="space-y-2" data-testid="audit-log">
      {data.map((a) => (
        <div key={a.id}
             className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-card/30 p-3 text-sm">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{a.brand?.name ?? a.brand_id}</span>
          <span className="text-muted-foreground">{a.previous_status ?? "—"} →</span>
          <StatusBadge status={a.new_status} />
          {a.reason && <span className="text-xs text-destructive">· {a.reason}</span>}
          <span className="ml-auto text-xs text-muted-foreground">
            by {a.admin_id.slice(0, 8)}… · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminBrandModeration() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Brand Moderation"
          subtitle="Review brand sign-ups, appeals and audit history."
          icon={ShieldAlert}
          badge="Brands"
          breadcrumbs={[{ label: "Brand Moderation" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
              <TabsTrigger value="appeals" data-testid="tab-appeals">Appeals</TabsTrigger>
              <TabsTrigger value="audit" data-testid="tab-audit">Audit log</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6"><QueueTable status="pending" /></TabsContent>
            <TabsContent value="approved" className="mt-6"><QueueTable status="approved" /></TabsContent>
            <TabsContent value="rejected" className="mt-6"><QueueTable status="rejected" /></TabsContent>
            <TabsContent value="appeals" className="mt-6"><AppealsQueue /></TabsContent>
            <TabsContent value="audit" className="mt-6"><AuditLog /></TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
